---
name: server-endpoint
description: Add or change a REST endpoint in server/ (Express 5 + Hasura via graphql-request), including validation, auth, error shape, rate limiting and tests. Use for any work under server/src/routes or server/src/controllers.
---

# Add or change a server endpoint

Read `server/CLAUDE.md` first: it covers the layout and the rules this skill relies on.

## 1. Route

- Add the route in `server/src/routes/...` and mount it from `routes/index.ts` or `routes/auth.ts`. Everything lives under `/api/v1`.
- Choose the guard explicitly:

  | Caller | Middleware |
  |---|---|
  | Hasura action / event trigger, or another backend | `requireServerSecret` (`middleware/serverSecret.ts`) |
  | Signed-in user | `userOnly`, or `authenticate({...})` (`middleware/auth.ts`) |
  | Anyone, but checks a password or OTP | `credentialLimiter` (`config/rate-limits`) |
  | Anyone, and sends SMS | `sendOTPLimit` |

  An endpoint with no guard is a decision. Write the reason in a comment on the route.

## 2. Controller

- Wrap the handler in `asyncHandler`. Validate `req.body` with a zod schema in `src/schemas/`, and reuse `phoneSchema`, `passwordSchema` and the OTP schemas there.
- Respond with `res.success(msg, data)`, `res.created(...)` or `res.message(...)`. For errors, throw `HttpError` subclasses from `utils/errors`. Don't call `res.status().json()` directly: clients parse the standard envelope `{ success, message, data, error, meta }`.
- Talk to Hasura only through `getGraphQLClient()` or `gqlClient`, and give every operation a name, such as `query GetThing(...)`. Tests route calls by operation name.
- OTP checks must go through `checkAndConsumeOTP()` (`controllers/otp/utils.ts`). Anything else creates a brute-force oracle.
- Sessions must be created with `issueSession()`. The row id has to equal the JWT `sessionId`, or refresh and logout break.
- Never log tokens, OTPs, passwords or full request bodies. Use `logger`, never `console`.

## 3. Test (required)

Add `server/tests/<area>.test.ts`:

```ts
import { api, SERVER_SECRET } from "./helpers/app";
import { fakeHasura } from "./helpers/fakeHasura";
import { installUser, installOTP, installSessionTable } from "./helpers/fixtures";

it("does the thing", async () => {
  fakeHasura.on("GetThing", ({ id }) => ({ thing_by_pk: { id } }));
  const res = await api().post("/api/v1/thing").send({ id: "1" });
  expect(res.status).toBe(200);
  expect(fakeHasura.callsTo("GetThing")[0].variables).toEqual({ id: "1" });
});
```

Cover at least: the happy path, invalid input (400), the auth guard (401/403), and every side effect (assert on `fakeHasura.callsTo(...)`).

## 4. Clients

Update every caller to match the new path and response shape:

- web: `web/src/actions`, `web/src/app`. Read errors with `getApiErrorMessage`.
- mobile: `mobile/lib`, `mobile/utils`, `mobile/app`.

Then run `scripts/check-all.sh`.
