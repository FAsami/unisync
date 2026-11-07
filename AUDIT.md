# UniSync consistency and security audit

_Audited 2026-11-07 across `server/`, `hasura/`, `web/`, `mobile/`, CI and docs. Every finding below was verified against the code; the server findings are also covered by tests in `server/tests/`._

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

## Open

### Critical and high

1. **Users with role `admin` hold Hasura's superuser role.**
   - **Where:** `server/src/controllers/auth/webhook/authorizeRequest.ts` passes `user.role` through, so a user whose role is `admin` gets `X-Hasura-Role: admin`.
   - **Why it matters:** That role bypasses every permission, including reading password hashes and all sessions. The mobile manage screens and the web dashboard only work because of this: no metadata role can insert or update batch, department, section, course, routine or user_account.
   - **Fix:** Create a scoped role (for example `university_admin`) with explicit permissions, and map app admins to it.
2. **Web registration can never succeed.**
   - **Where:** `web/src/actions/auth/register.ts` sends only `{phone, password, email}`.
   - **Why it matters:** `registerSchema` requires `first_name`, `last_name`, and `student_id` (role defaults to student), so every sign-up gets a 400.
   - **Fix:** This needs a product decision: add the fields to the web form, or give web sign-ups their own schema.
3. **Mobile axios never throws.**
   - **Where:** `mobile/lib/axios.ts` (`validateStatus: () => true`).
   - **Why it matters:** Every `catch` that handles 401 or `SESSION_REVOKED` is dead code (`lib/auth.ts`, `utils/token.ts`, `app/login.tsx`). Revoked or expired sessions are never detected.
   - **Fix:** Check `response.status`, or remove the override and audit every caller.
4. **Mobile has two auth modules.**
   - **Where:** `lib/auth.ts` and `utils/token.ts` duplicate the refresh logic, and each has its own `authEventEmitter`. The contexts only listen to the one in `lib/auth.ts`.
   - **Also:** Refresh is not single-flight, and the server rotates refresh tokens, so parallel requests can log users out.
   - **Fix:** Merge into one module with one shared in-flight refresh promise.
5. **Device rows (`user_device.yaml`, `contexts/FCM.tsx`, `lib/fcm.ts`).**
   - The student update permission's `check` requires `is_active: true`, so a device can never be deactivated.
   - The update `filter: {}` lets any student rewrite any user's device row.
   - Deactivation runs after logout has already cleared the tokens.
   - `Device.modelId` is iOS-only, so all Android devices share the device id `"android"`.
   - **Consequence:** Logged-out phones keep receiving the previous user's pushes, and a user's devices collapse into one row.
6. **The auth webhook ignores session state.** It does not check `revoked`, `is_active` or `deleted_at`. Logout, account deletion and password reset do not invalidate access tokens until they expire (up to 1 h).
   - **Fix:** Look up the session in the webhook, and return `Cache-Control: max-age=…` so Hasura caches the result.
7. **Students cannot read notifications.** `notification_log.yaml` gives the `student` select `columns: []`, so `GET_USER_NOTIFICATIONS` errors. The filter also needs designing: `{}` would expose every notification.
8. **Public registration accepts `role: "teacher"`** (`server/src/schemas/auth.schema.ts`). Anyone can self-register as faculty.

### Medium

- **Soft delete is half-built.**
  - Login lets deleted accounts in without restoring them; restoring relies on the mobile `RESTORE_USER_ACCOUNT` mutation.
  - Nothing purges accounts after 30 days (`cron_triggers.yaml` is empty).
  - The admin `DELETE_USER` mutation hard-deletes, and `GET_ALL_USERS` lists deleted users.
- **`/otp/send` doesn't check the account.** It sends an SMS for `PASSWORD_RESET` and `DELETE_ACCOUNT` to any number, even when no account exists. This is now rate-limited, but still costs SMS credits.
- **The Hasura `sendOTP` action is broken and unused.** The server reads `req.body`, but actions wrap arguments in `input`, and the action's enum lacks `DELETE_ACCOUNT`. Clients call REST directly. Remove the action or fix it.
- **Login leaks whether an account exists** (`USER_NOT_FOUND` vs `INVALID_CREDENTIALS`).
- **Phone formats disagree.** Register and login accept local formats (`017…`), but `/otp/send` requires E.164, so the same user can end up with different identifiers.
- **The server has two error envelopes.**
  - REST: `{success:false,error:{…}}`
  - action-style: `{message,extensions}`, from `/otp/*` and `/auth/account/delete`
  - The mobile `verify-otp.tsx` reads `data.error?.message` and so misses action-style messages.
- **SMS goes over plain HTTP to a raw IP**, so the API key and secret travel in cleartext. The provider config stored in `settings.config` is fetched and then ignored.
- **Expo SDK 53 dependency drift.**
  - `react-native-reanimated` 4.1 and `react-native-worklets` are installed, but SDK 53 expects reanimated ~3.17. The worklets babel plugin is also added a second time.
  - `expo-linear-gradient` ^15 belongs to SDK 54.
  - `@react-native-community/cli` is pinned to `latest`, and `react-native-codegen` is a stale extra.
  - **Fix:** Run `npx expo install --check`, then either align with SDK 53 or upgrade to SDK 54.
- **Android release builds are signed with the debug keystore** (`mobile/android/app/build.gradle`).
- **Web token handling.**
  - Tokens sit in non-httpOnly cookies for 7 days, while the access token lives for 1 hour.
  - There is no logout UI.
  - The Apollo client is a module singleton on the Next server.
  - Dashboard lists ignore query `error`.
- **`docker-compose.yml`.**
  - `hasura/graphql-engine:latest` is unpinned.
  - The `/hasura-metadata` volume does nothing without the `cli-migrations` image.
  - The dev admin secret is `123`.
- **Sentry starts after Express is imported**, so v9 auto-instrumentation is incomplete. Move initialisation into an `instrument.ts` file that is imported first.
- **Two notification send paths** (`utils/notification.ts` and `services/notificationService.ts`). Failed FCM tokens are never deactivated (there is a TODO for it).

### Low

- **web:**
  - `eslint-config-next` 16 is installed alongside `next` 15, and `tsconfig` includes `.next/dev/types`, a Next 16 path.
  - Unused dependencies: `zod`, `react-hook-form`, `@hookform/resolvers`, `libphonenumber-js`.
  - `transpilePackages: ['@ant-design']` is a scope, not a package, so it does nothing.
  - `encrypt.ts` uses a fixed salt.
  - App-store links point to `#`.
  - Assorted dead helpers.
- **mobile:**
  - Unused dependencies: `react-native-vector-icons`, `react-aria`, `react-stately`, `react-native-webview`, `expo-web-browser`, `expo-image`, `expo-notifications`, `react-native-make`.
  - Unused gluestack components and template assets.
  - `lib/graphql/generated.ts` is never imported.
  - `components/form/*` duplicates `components/auth/*`.
  - The deep-link scheme is the generic `mobile`.
  - 100 lint warnings, mostly unused variables.
- **hasura:**
  - The `class_representative` notification insert does not restrict which section it targets.
  - `GET_MY_SENT_NOTIFICATIONS` is not filtered by `created_by`.
- **server:**
  - `codegen.yml` hardcodes the admin secret.
  - `fly.toml` sets variables nothing reads: `RATE_LIMIT_*`, `OTP_MAX_ATTEMPTS`, `OTP_VERIFY_LIMIT_PER_15MIN`, `API_VERSION`.

---

## Deploy notes for the fixes above

- **Set `SERVER_AUTH_SECRET` on the server** (`fly secrets set SERVER_AUTH_SECRET=…`) to the same value Hasura uses. Until then, Hasura event triggers get a 503 and notifications stop. This is deliberate: the alternative was leaving the endpoints open.
- **Run `hasura metadata apply`** in each environment. This removes the guest session-token permission and tracks the OTP table again.
- Existing tokens keep working. Tokens issued before the `typ` claim are accepted until they expire.
