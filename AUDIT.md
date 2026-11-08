# UniSync consistency and security audit

_First audited 2026-11-07 across `server/`, `hasura/`, `web/`, `mobile/`, CI and docs. Updated 2026-11-08 for the move to a single backend: the .NET API in `api/` replaced Hasura and the Node server, so most of the original open items were resolved by removing the code they were about. The original findings were verified against the code; the API's behaviour is covered by its tests in `api/tests/`._

The `/consistency-audit` skill describes how to repeat this audit. When you fix an open item, move it to **Fixed** and add the commit hash.

---

## Fixed

### Critical

| Area | Problem | Consequence | Commit |
|---|---|---|---|
| hasura | `guest-consumer` could select every `user.session` row, including `access_token` and `refresh_token`. Anyone can get a guest token from the public `/auth/session/guest`. | Anyone could take over any account. | 7e19d5a |
| hasura | `tables.yaml` included `user_otp_transaction.yaml`, which had been deleted. | `hasura metadata apply` failed. On fresh environments the OTP table was untracked, so every OTP flow failed. | 7e19d5a |
| hasura | The init migration created `hdb_catalog` (Hasura's own schema). | `hasura migrate apply` failed on every new environment (`schema "hdb_catalog" already exists`). | 07d2c66 |
| hasura | The init migration contained pg_dump's `\restrict` / `\unrestrict` lines, which only `psql` understands. | `hasura migrate apply` sends SQL straight to Postgres, which rejects line 5 with a syntax error, so fresh environments still could not be set up. | this branch |
| server | Login and register/verify inserted the session row with the DB default id instead of the JWT `sessionId`. | Logged-in users could **never** refresh their tokens, because refresh rejected them as `SESSION_MISMATCH`. Logout silently revoked nothing. | eac9d73 |
| server | `/webhook/events/send-notification` and `/notification/send` had no authentication. `SERVER-AUTH-SECRET` was sent by Hasura but never checked. | Anyone could push notifications to every user and rewrite `notification_log` rows. | eac9d73 |
| server | The `all` broadcast query declared a required `$targetType` variable that was never sent. | Every "send to all users" notification failed. | eac9d73 |
| server | `register/verify` and `reset-password/verify` did not count wrong OTP guesses, and all rate limiters were commented out. | Unlimited brute force of 6-digit OTPs, which allows taking over any account through password reset. | eac9d73 |
| web | Apollo always sent the **guest** token, even for signed-in users. | The dashboard queried Hasura as `guest-consumer`, which has no access to dashboard tables. | 1d88637 |
| mobile | The logged-in token refresh posted to `/auth/session/verify`, which does not exist. | Every user was logged out about an hour after login. | 1d88637 |

### High and medium

| Area | Problem | Commit |
|---|---|---|
| server | Refresh tokens (30 days) were accepted as access tokens. Tokens now carry a `typ` claim. | eac9d73 |
| server | No `trust proxy` behind Fly, so per-IP limits became one global limit. The OTP limiter trusted a client-supplied `X-Forwarded-For`. | eac9d73 |
| server | Account deletion did not revoke sessions. | eac9d73 |
| server | Notification audiences included soft-deleted accounts. | eac9d73 |
| server | SMS query parameters were not URL-encoded, so the `+` in `+880…` reached the gateway as a space. Axios errors logged the URL, which contains the API key and secret. | eac9d73 |
| server | Access tokens, decoded JWTs, OTP request bodies and SMS provider config were written to console logs. | eac9d73 |
| server | The logger ignored `LOG_LEVEL` and `LOG_FILE_ENABLED` from `fly.toml`, so production showed warnings only. Unexpected 5xx errors never reached Sentry. | eac9d73 |
| server | `webhookLimiter` used a 1 ms window. Docker used `node:alpine` (unpinned). Several dependencies were unused or deprecated. `strict` mode was off. | eac9d73 |
| web | `proxy.ts` is the Next 16 file name, so under Next 15 the middleware never ran. | 1d88637 |
| web | The dashboard login redirect had a stray brace (`redirect=/dashboard}`), sending users to a 404 after login. | 1d88637 |
| web | Open redirect through `/auth/login?redirect=https://…`. | 1d88637 |
| web | Registration ignored `/otp/send` failures. Verify forms showed generic errors instead of server messages. | 1d88637 |
| mobile | `@/constants/theme` vs `Theme.ts`: a case mismatch that breaks Linux and EAS builds. | bddb676 |
| repo | No CI, and server deploys ran without any checks. A 6.5 MB CodePush bundle was committed. No env templates for web or mobile. README linked to missing files and used npm commands. | b3bce80 |
| hasura | The `deleted_at` migration had an empty `down.sql`. | 7e19d5a |

### Fixed by the mobile switch to the new API

| Problem | Commit |
|---|---|
| Two mobile auth modules with separate event emitters, no shared refresh: they are replaced by one session (SecureStore, one shared refresh, one retry on an expired token) | this branch |
| Password reset showed success on a wrong code, and unfinished sign-ups were stuck: passwords are gone and sign-in is phone plus code | this branch |
| Home showed every section's classes and ignored cancellations: it now uses `GET /me/today` | this branch |
| A logged-out phone kept getting pushes, and Android devices collided on `Device.modelId`: tokens now register under an install id, move to the latest user, and logout switches the device off | this branch |
| No SMS autofill, a typed "+880", generic errors: fixed prefix, autofill and auto-submit, server messages shown | this branch |

---

### Resolved by the move to `api/`

These were open on 2026-11-07. The code they described is gone, and the API's design and tests cover each one.

| Was open | How it's resolved |
|---|---|
| Users with role `admin` held Hasura's superuser role, which bypassed every permission | No Hasura. A department admin is role `admin` plus `managed_department_id`. Every setup query filters by that department, and another department's records answer 404 (`Setup/SetupScope.cs`, tests in `DepartmentSetupTests`, `PeopleSetupTests`, `TimetableSetupTests`). |
| Web registration could never succeed | No self-registration: the department keeps the roster, and unknown numbers use **Request access**. |
| Mobile axios never threw, so 401 handling was dead code | axios is removed. The typed client (`mobile/lib/api`) checks every status. |
| Mobile had two auth modules and no single-flight refresh | One session module (`mobile/lib/api/session.ts`) |
| Device rows: no deactivation, any student could rewrite any device, Android ids collided | `PUT /me/devices` under an install id; a token belongs to one person; logout, deactivation, a number change and account deletion all turn devices off. |
| The auth webhook ignored session state | `BearerEvents` re-checks the session, account and `deleted_at` on every request. |
| Students could not read notifications | Inbox: `GET /me/notifications`, with read state in `notification.read` |
| Public registration accepted `role: "teacher"` | No public registration. Teachers are added by their department admin, and admins only through `create-admin`. |
| Soft delete was half-built | `DELETE /me` sets `deleted_at` and `is_active = false`, revokes every session and turns off devices in one transaction; `/auth/code` refuses deleted accounts. The "restore within 30 days" promise was dropped. |
| `/otp/send` sent SMS to numbers with no account | Sign-in codes go only to active roster accounts. Access-request codes are bound to that purpose and rate-limited per number and per IP. |
| The Hasura `sendOTP` action was broken | Gone with Hasura |
| Phone formats disagreed between endpoints | One normaliser (`Auth/PhoneNumber.cs`): every endpoint accepts local or international spellings and stores E.164. |
| Two error envelopes | One envelope everywhere, including 401, 404, 429 and 500 |
| Two notification send paths; failed FCM tokens never deactivated | Writers only insert into `notification.log`; `PushDispatcher` delivers and turns off dead tokens. |
| Web tokens in non-httpOnly cookies, no logout UI | The web dashboard was rebuilt on the API: tokens stay on the Next.js server in httpOnly cookies, and it has sign out. |
| Hasura metadata issues: CR notices could target any section; sent notices weren't filtered by sender | `AudienceService` decides who may address whom; `GET /notifications/sent` returns only your own. |
| Server issues: Sentry initialised late, `codegen.yml` held the admin secret, `fly.toml` had unused variables | `server/` is gone. |
| `docker-compose.yml`: unpinned `hasura/graphql-engine:latest`, a no-op metadata volume, admin secret `123` | The Hasura service is gone. Only PostgreSQL (pinned 17.5) remains. |
| Mobile: unused `lib/graphql/generated.ts`, `components/form/*` duplicating `components/auth/*` | Removed with the GraphQL code and the setup screens |
| "Login leaks whether an account exists" | Now deliberate: `/auth/code` answers `PHONE_NOT_REGISTERED` so the app can offer **Request access** (UX review). It is rate-limited per IP. |

---

## Open

### Medium

- **SMS goes over plain HTTP to a raw IP.** The API's BulkSMSBD sender defaults
  to `http://118.67.213.114:3775/sendtext` (`Sms:Endpoint`), so the API key and
  secret travel in cleartext.
  - **Fix:** Use the provider's HTTPS endpoint if one exists, and set `Sms__Endpoint`.
- **Expo SDK 53 dependency drift.**
  - `react-native-reanimated` 4.1 and `react-native-worklets` are installed, but
    SDK 53 expects reanimated ~3.17. The worklets babel plugin is also added a
    second time.
  - `expo-linear-gradient` ^15 belongs to SDK 54.
  - `@react-native-community/cli` is pinned to `latest`, and `react-native-codegen`
    is a stale extra.
  - **Fix:** Run `npx expo install --check`, then either align with SDK 53 or
    upgrade to SDK 54.
- **Android release builds are signed with the debug keystore**
  (`mobile/android/app/build.gradle`).
- **Rate limits are per machine.** The API's per-IP and per-user fixed windows
  live in memory, so running N Fly machines multiplies every limit by N. The
  per-number code limit is stored in the database, so it is unaffected.
  - **Fix:** Keep one machine, or move the limits to Postgres or Redis before scaling out.
- **Web sign-ins share one per-IP bucket.** The web app calls the API through its
  server-side proxy, so the API sees the web server's IP for every admin. All web
  sign-ins share the 10-codes-an-hour per-IP limit (the per-number limit still
  applies). Fine for a handful of admins.
  - **Fix:** Have the proxy send the client IP in a header signed with a shared
    secret, and let the API trust it only with that secret.

### Low

- **Legacy tables the API doesn't use.** These can be dropped in a later
  migration once production has been switched over (`CUTOVER.md`):
  - the `event.event*` family and `event.group_assignment`
  - `user.otp_rate_limit`
  - `settings.config`
  - `academic.faculty` and `academic.department.faculty_id`
  - `user.account.password`
- **Setup error messages can reveal other departments' data**, to department
  admins only:
  - routine clash errors name another department's section and course
  - adding a teacher or student, or importing a roster, says whether a number
    already has an account and what kind
  - **Fix:** Use generic messages when the clashing or existing record belongs to another department.
- **Sent notices show "Sending push…" until push delivery is on.** While
  `Push:Enabled` is false (until CUTOVER.md step 5), `notification.log` rows
  stay `pending`. Notices still reach the inbox.
- **Deleted accounts are never purged.** `DELETE /me` is a soft delete. Decide
  whether a retention period is needed, and if so add a scheduled purge.
- **mobile:**
  - Unused dependencies: `react-native-vector-icons`, `react-aria`,
    `react-stately`, `react-native-webview`, `expo-web-browser`, `expo-image`,
    `expo-notifications`, `react-native-make`. Re-check these after the GraphQL
    removal.
  - Unused gluestack components and template assets.
  - The deep-link scheme is the generic `mobile`.
  - 58 lint warnings, mostly unused variables.
- **web:** re-check these against the rebuilt dashboard:
  - `eslint-config-next` 16 is installed alongside `next` 15.
  - `transpilePackages: ['@ant-design']` is a scope, not a package, so it does nothing.
  - App-store links point to `#`.

---

## Production

Production still runs Hasura Cloud and the Node server until the steps in
`CUTOVER.md` are done. Until then, the old stack's deploy notes still apply:

- **Set `SERVER_AUTH_SECRET` on the server** (`fly secrets set SERVER_AUTH_SECRET=… -a unisync-server`)
  to the same value Hasura uses. Until then, Hasura event triggers get a 503 and pushes stop.
- **Run `hasura metadata apply`** in each environment. This removes the guest
  session-token permission and tracks the OTP table again.

After the cut-over, neither applies: the API sends pushes itself and there is no Hasura.
