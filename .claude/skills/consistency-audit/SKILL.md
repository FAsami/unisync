---
name: consistency-audit
description: Audit UniSync for cross-layer inconsistencies, where server routes, web and mobile clients, Hasura metadata, env vars and docs disagree, and record findings in AUDIT.md. Use when asked what is broken, to review project health, or before a release.
---

# Cross-layer consistency audit

UniSync has four layers that must agree: `server/` (REST), `hasura/` (GraphQL plus permissions), `web/` (Next.js admin) and `mobile/` (Expo). Most real bugs live at the seams between them, where no single typecheck can see.

Run `scripts/check-all.sh` first, so tooling failures are separated from logic bugs.

## Contract checks

1. **Endpoints.** List every route:

   ```bash
   grep -rn "router\.\(get\|post\|put\|patch\|delete\)" server/src/routes
   ```

   Then list every client call:

   ```bash
   grep -rn "\.post(\|\.get(" web/src mobile/lib mobile/utils mobile/app mobile/contexts | grep "'/"
   ```

   Every client path must exist on the server, and the request body must satisfy that route's zod schema in `server/src/schemas`. (This audit found mobile posting to `/auth/session/verify`, which doesn't exist, and web registration missing required fields.)
2. **Response and error shapes.** The server has two error shapes:
   - REST: `{success:false, error:{message, code}}`
   - action-style: `{message, extensions:{code}}`, used by `/otp/*` and `/auth/account/delete`

   Check that each client reads the right one. Web should use `getApiErrorMessage`.
3. **HTTP status handling.** Both clients' axios instances use `validateStatus: () => true`, so axios never throws. Any `catch` that expects a 401 is dead code. Callers must check `response.status`.
4. **Auth.** Check token storage, refresh (single in-flight request?), logout (server revoke plus local clear plus device deactivation), and which token each Apollo client sends.
5. **Hasura vs. clients.** For each GraphQL operation in `mobile/lib/graphql-operations.ts` and `web/src/components/**`, check that the role actually holding the token has permission for every field and mutation. Watch for roles with `columns: []`, missing insert or update permissions, and anything that only works because the user is `admin`.
6. **Hasura vs. server.**
   - Action and event-trigger URLs must match server routes.
   - Payload shape: Hasura actions wrap arguments in `input`.
   - Every webhook must send `SERVER-AUTH-SECRET`.
7. **Env vars.**
   - Every `process.env.X` in a package must appear in that package's env template (`server/env.example`, `web/.env.example`, `mobile/.env.example`).
   - Values must be consistent with `docker-compose.yml` (ports 9200/9201/9203) and `server/fly.toml`.
8. **Dependencies.**
   - Expo SDK alignment: `cd mobile && npx expo install --check`.
   - Next and `eslint-config-next` majors must match.
   - Look for unused dependencies.
9. **Docs.** Commands in `README.md` and `CLAUDE.md` must actually run, and the files they link to must exist.

## Output

Update `AUDIT.md`:
- Move fixed items to "Fixed", with the commit hash.
- Add new findings under the right severity, using the format `file:line`, then what goes wrong, then the concrete consequence, then the suggested fix.

Verify every finding with evidence (code, a test, or a command) before listing it. Never list a finding you only suspect.
