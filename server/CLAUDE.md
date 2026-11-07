# server/

Express 5 API, mounted at `/api/v1`. Entry point: `src/index.ts`. The app is exported and does not listen when `NODE_ENV=test`.

```
src/routes/          route wiring and guards (one file per area)
src/controllers/     handlers, always wrapped in asyncHandler
src/schemas/         zod input schemas (phone, password, OTP, register...)
src/middleware/      auth (JWT), serverSecret (Hasura → server), errorHandler, requestInfo
src/config/          environment, logger, rate-limits, security (helmet/CORS), sentry
src/lib/             graphqlClient (Hasura admin), firebase, SMS providers
src/utils/           jwt, response envelope (res.success/res.error...), errors
tests/               vitest + supertest; tests/helpers/fakeHasura.ts replaces Hasura
```

## Invariants (tests enforce these)

- **`issueSession()` is the only way to create a user session.** The `user_session.id` must equal the JWT `sessionId` claim: `/auth/session/refresh` checks it, and `/auth/logout` revokes by it.
- **Tokens carry `typ: "access" | "refresh"`.** Use `JWTService.verifyAccessToken` and `JWTService.verifyRefreshToken` and never swap them. Legacy untyped tokens are still accepted.
- **`checkAndConsumeOTP()` is the only way to check an OTP.** It enforces expiry and `MAX_OTP_ATTEMPTS`, and marks the OTP used.
- **Hasura-facing endpoints use `requireServerSecret`.** It fails closed when `SERVER_AUTH_SECRET` is unset.
- **Every GraphQL document is named and its variables match exactly.** `tests/graphql-documents.test.ts` scans all of `src/`.
- **Queries that pick users exclude soft-deleted accounts** (`deleted_at: { _is_null: true }`).
- `app.set("trust proxy", 1)` is required for per-IP limits behind Fly. Never read `X-Forwarded-For` yourself; use `req.ip`.

## Testing pattern

```ts
fakeHasura.on("OperationName", (variables) => ({ ...response }));   // per test
const res = await api().post("/api/v1/...").send(body);
expect(fakeHasura.callsTo("OperationName")).toHaveLength(1);
```

`tests/helpers/fixtures.ts` provides an in-memory session table (`installSessionTable`), a user (`installUser`) and a live OTP row (`installOTP`). Any GraphQL operation without a registered handler throws, so new queries cannot go untested.

## Env

`env.example` documents every variable. Production values live in `fly.toml` (non-secret) and `fly secrets` (`JWT_SECRET`, `HASURA_ADMIN_SECRET`, `SERVER_AUTH_SECRET`, `BULK_SMS_*`, `FIREBASE_SERVICE_ACCOUNT_BASE64`, `SENTRY_DSN`).
