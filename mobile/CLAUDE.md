# mobile/

Expo SDK 53 app. **Sign-in, "My day" (Home) and push registration use the new .NET API** (`api/`). The other screens (schedule, alerts, manage, profile) still query Hasura through Apollo, using the same tokens.

```
lib/api/generated.ts    types generated from api/openapi/v1.json (yarn api:types); never edit
lib/api/client.ts       typed openapi-fetch client: bearer token, one retry on TOKEN_EXPIRED
lib/api/session.ts      the one session: SecureStore tokens, one shared refresh, sign-in/out events
lib/api/errors.ts       ApiError, unwrap(), call(): read the API envelope, never assume success
lib/api/index.ts        app-wide `session` and `api`
lib/phone.ts            Bangladeshi number rules (same as the API)
lib/schedule.ts         wording for class statuses (cancelled, moved, room changed)
lib/installId.ts        stable per-install id that push tokens are registered under
contexts/Auth.tsx       React view of the session (useAuth)
app/login.tsx → app/verify-otp.tsx      passwordless sign-in
app/request-access.tsx                  for numbers not on the roster
app/(tabs)/index.tsx                    "My day" from GET /me/today
```

## Rules

- **Call the new API only through `api`**, and read the result with `unwrap()` inside `call()`: `await call(async () => unwrap(await api.GET('/api/v1/me/today')))`. This throws an `ApiError` carrying the server's message. Show `error.message`; it's written for students.
- **Tokens live only in `lib/api/session.ts`.** Never read or write them anywhere else. To react to sign-out, use `session.subscribe`.
- **API changed?** Run `cd mobile && yarn api:types` after the API's `UPDATE_OPENAPI=1` step. CI fails if `lib/api/generated.ts` is stale.
- Legacy calls (`lib/axios.ts`, the Node server) remain only for the manage screens. Its axios never throws (`validateStatus: () => true`), so check `response.status`.

## Commands

```bash
yarn lint && yarn typecheck && yarn test
yarn api:types                    # regenerate the typed API client
# End-to-end against a running API (Development mode prints SMS codes to its log):
UNISYNC_LIVE_API=http://localhost:9202 UNISYNC_LIVE_SMS_LOG=/path/api.log \
UNISYNC_LIVE_PHONE=+8801XXXXXXXXX UNISYNC_LIVE_COURSE=CSE101 npx jest lib/api/__tests__/live.test.ts
```

## Seeing the screens without a device

`web-preview/` renders the app in a phone-sized browser, so you can check a screen against a real API without an emulator. `metro.config.js` swaps the native-only modules (CodePush, Firebase, SecureStore) for the stubs in `web-preview/stubs` on web only; native builds are untouched.

```bash
# 1. Run the API in Development (it prints SMS codes to its log) against a seeded database.
# 2. Build for web, pointing API_URL at the preview server so calls stay same-origin:
API_URL=http://127.0.0.1:8090 npx expo export --platform web --output-dir dist-web-preview --clear
# 3. Serve it, proxying /api/* to the API:
node web-preview/serve.mjs 8090 http://127.0.0.1:9202
# 4. Walk sign-in and "My day" and save screenshots:
node web-preview/screens.mjs http://127.0.0.1:8090 /path/api.log +8801XXXXXXXXX ./screens
```

It can't show native-only behaviour: push, the real keychain, CodePush, or exact device layout.
