# web/

The department admin's setup tool (Next.js 15 App Router, antd 5, Tailwind 4),
plus the landing page and the public account-deletion page. It talks only to
the .NET API (`api/`). Students and teachers use the mobile app; a non-admin who
signs in here is shown "Use the UniSync mobile app".

```
src/actions/session.ts         server actions: requestCode, verifyCode, signOut, deleteAccount
src/app/api/v1/[...path]/      same-origin proxy to the API; adds the token from the cookie
src/app/api/session/refresh/   rotates the session cookies (the browser client calls it on a 401)
src/app/auth/login/            passwordless sign-in (phone, then texted code)
src/app/dashboard/*            overview, access requests, department, batches & sections,
                               courses, teachers, students (+ CSV import, CR mark),
                               course offerings, weekly routine, buildings & rooms
src/app/delete-account/        public: sign in with a code, confirm, DELETE /me
src/lib/api/                   generated.ts (openapi-typescript), client.ts, errors.ts, schema.ts
src/lib/session/server.ts      cookie names and options, server-side API client
src/components/setup/          FormModal, RosterImport, PageHeader, SectionSelect, useDelete
```

## Rules

- **Tokens live only in httpOnly cookies.** Server actions put them there; the
  proxy and the refresh route read them. Never return a token to client code
  or store one in JS-readable storage. The proxy refuses `/api/v1/auth/*`.
- **Call the API through `api` from `@/lib/api/client` and `unwrap()`**, which
  returns `data` or throws an `ApiError` carrying the API's message. Show
  `error.message`: it is written for people. Field errors from
  `VALIDATION_FAILED` land under form fields via `FormModal` / `formError`.
- **Partial updates**: request bodies list every field as required-but-nullable;
  the API reads missing or null as "leave as is". Write `body: fields({ isActive: false })`
  inline. Send `''` to clear an optional text.
- **Refresh happens once per tab** in `client.ts`. Refresh tokens are single-use,
  so never refresh from several places at once (the API revokes a replayed one).
- **Deleting something in use** answers `409 IN_USE`; `useDelete` then offers
  "Mark inactive" where the record has an active flag.
- **API changed?** `cd web && yarn api:types` after the API's `UPDATE_OPENAPI=1`
  step. `src/lib/api/generated.ts` is generated: never edit it.

## Commands

```bash
yarn dev                     # http://localhost:3000, needs API_URL (see .env.example)
yarn lint && yarn typecheck && yarn format:check && yarn build
yarn api:types               # regenerate src/lib/api/generated.ts from api/openapi/v1.json
```

To try it locally: run the API in Development (codes print to its log), create
the first admin with `dotnet run --project src/UniSync.Api -- create-admin ...`
(see api/CLAUDE.md), then sign in here with that number.
