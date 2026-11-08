# Architecture overview

UniSync has one backend, the .NET API in `api/`. It serves two clients: the
mobile app and the web dashboard.

```
mobile (Expo) ── HTTPS + bearer token ──┐
                                        ▼
web browser ─▶ Next.js server ─────▶  api/ (ASP.NET Core 10, EF Core)  ──▶  PostgreSQL
               (httpOnly cookies)       │
                                        ├──▶ BulkSMSBD: sign-in codes
                                        └──▶ FCM HTTP v1: pushes (PushDispatcher)
```

## The API (`api/`)

- **Stack:** ASP.NET Core 10 minimal APIs, EF Core 10 with Npgsql (snake_case
  names), xUnit tests against a real PostgreSQL.
- **Contract:** `api/openapi/v1.json` is generated from the code, committed, and
  checked for drift by a test. Mobile and web generate typed clients from it
  (openapi-typescript and openapi-fetch).
- **One response shape:** every response, errors included, is
  `{ success, message, data, error: { code, message, details }, meta }`. See the [API reference](/api/).
- **Schema ownership:** the API's own SQL migrations in `api/db/migrations`
  build the database. See [Database schema](./database-schema).
- **Time:** class times are campus-local (Asia/Dhaka). "Now" and "today" come
  from one clock service (`CampusClock`), never from UTC.

Code layout (`api/src/UniSync.Api`):

| Folder | Responsibility |
| --- | --- |
| `Auth/` | Phone numbers, one-time codes, tokens, sessions, `/auth/*` |
| `CurrentUser/` | `/me`, account deletion |
| `AccessRequests/` | Request to join, and the department admin's queue |
| `Academic/` | `/directory`: public list of departments, batches and sections (for access requests) |
| `Schedule/` | "My day", the week, class changes and who may make them |
| `Notifications/` | Inbox, devices, sending, audiences, and `Push/` (delivery) |
| `Setup/` | Department setup for the web dashboard, and the `create-admin` command |
| `Data/` | EF Core entities, `DbContext`, `MigrationRunner` |
| `Common/` | Response envelope, error codes, exception handling, OpenAPI helpers |

## Mobile (`mobile/`)

Expo (React Native) with expo-router. It talks to the API only through
`lib/api`, a typed client with a single session module. Tokens live in
SecureStore, and only one refresh runs at a time. See [Mobile app](/guide/mobile-app).

## Web (`web/`)

Next.js (App Router) with antd. Sign-in is passwordless. The session is kept in
httpOnly cookies on the Next.js server, which forwards the browser's API calls
to the API. The dashboard is for department admins only. See
[Department setup](/guide/department-setup).

## Security model

- **Roster-only sign-in.** A code is sent only to an active account. Codes expire,
  attempts are capped, sends are rate-limited per number and per IP, and each
  code is bound to its purpose (sign-in or access request).
- **Sessions are database rows**, re-checked on every request. Signing out,
  deactivating someone or deleting an account takes effect immediately, not when
  the token expires. Refresh rotates both tokens, and replaying an old refresh
  token revokes the session.
- **Department scoping.** A department admin is role `admin` plus the department
  they manage. Every setup query filters by that department, so another
  department's records answer 404.
- **Audiences have one definition** (`AudienceService`). It decides both who may
  address an audience and who receives a notice.
