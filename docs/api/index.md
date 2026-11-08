# API reference

The UniSync API is an ASP.NET Core application in `api/`. All routes are under
`/api/v1`.

| Environment | Base URL |
| --- | --- |
| Local | `http://localhost:9202/api/v1` |
| Production | `https://unisync-api.fly.dev/api/v1` (planned custom domain: `api.uni-sync.site`) |

## The contract

The full, always-current list of endpoints, request bodies and responses is the
OpenAPI document
[`api/openapi/v1.json`](https://github.com/FAsami/unisync/blob/main/api/openapi/v1.json).
It is generated from the code and committed, and a test fails when the two
differ. Both apps generate their typed clients from it, so read that file
rather than a hand-written copy. The running API also serves it at `/openapi/v1.json`.

## Response envelope

Every response uses the same envelope. That includes 401, 404, 429 and 500.

```json
{
  "success": true,
  "message": "Saved",
  "data": { "...": "..." },
  "error": null,
  "meta": { "timestamp": "2026-11-08T09:00:00Z", "path": "/api/v1/me", "requestId": "…" }
}
```

```json
{
  "success": false,
  "message": null,
  "data": null,
  "error": { "code": "VALIDATION_FAILED", "message": "Some fields need fixing.", "details": { "phone": "Enter a Bangladeshi mobile number, like 01712345678." } },
  "meta": { "timestamp": "…", "path": "/api/v1/students", "requestId": "…" }
}
```

`error.message` is written for the person using the app, so clients show it
as is. `error.code` is stable and part of the contract. `error.details` carries
per-field messages (validation) or per-row results (roster import).

## Error codes

| Code | Meaning |
| --- | --- |
| `INVALID_REQUEST`, `VALIDATION_FAILED` | The body is malformed, or fields are invalid (see `details`) |
| `INVALID_PHONE` | Not a Bangladeshi mobile number |
| `PHONE_NOT_REGISTERED` | No active account has this number. Offer "Request access". |
| `TOO_MANY_CODES`, `TOO_MANY_ATTEMPTS`, `RATE_LIMITED` | Limits on codes, guesses or requests |
| `SMS_FAILED` | The SMS gateway didn't accept the message |
| `INVALID_CODE`, `CODE_EXPIRED` | Wrong or expired one-time code |
| `ALREADY_REGISTERED`, `ALREADY_EXISTS` | The number already has an account, or the record already exists |
| `REQUEST_PENDING`, `ALREADY_DECIDED` | Access request already waiting, or already approved or rejected |
| `STUDENT_ID_TAKEN`, `INVALID_SECTION` | Access request problems |
| `NOT_A_CLASS_DAY`, `CLASS_IN_PAST` | The class doesn't happen on that date, or has already finished |
| `SECTION_BUSY`, `TEACHER_BUSY`, `ROOM_TAKEN` | A clash, when moving a class or adding a routine slot |
| `AUDIENCE_NOT_ALLOWED`, `EMPTY_AUDIENCE` | You can't send to that audience, or nobody is in it |
| `IN_USE` | Can't delete something still in use. Mark it inactive instead. |
| `UNAUTHORIZED`, `TOKEN_EXPIRED`, `SESSION_REVOKED` | No valid token. On `TOKEN_EXPIRED`, refresh. On `SESSION_REVOKED`, sign in again. |
| `FORBIDDEN` | Signed in, but not allowed (for example an admin without a department) |
| `NOT_FOUND` | Doesn't exist, or belongs to another department |
| `DATABASE_UNAVAILABLE` | `/health/ready` only: the database can't be reached (503) |
| `INTERNAL_ERROR` | Unexpected failure |

## Endpoint groups

| Group | Routes | Who |
| --- | --- | --- |
| Health | `GET /health`, `GET /health/ready` (checks the database) | anyone |
| Sign-in | `POST /auth/code`, `/auth/verify`, `/auth/refresh`, `/auth/logout` | anyone; logout signed in |
| Access requests | `POST /access-requests/code`, `POST /access-requests`; queue: `GET /access-requests`, `POST /access-requests/{id}/approve`, `.../reject` | anyone; queue: department admin |
| Directory | `GET /directory` (open departments, batches and sections) | anyone |
| Me | `GET /me`, `DELETE /me` | signed in |
| Schedule | `GET /me/today`, `GET /me/week` | signed in |
| Class changes | `POST /classes/{routineId}/{date}/cancel`, `/move`, `/room`; `DELETE /classes/{routineId}/{date}` (undo) | the class's teacher, a CR of its section, its department's admin |
| Inbox | `GET /me/notifications`, `GET /me/notifications/{id}`, `POST .../{id}/read`, `POST /me/notifications/read-all` | signed in |
| Devices | `PUT /me/devices`, `DELETE /me/devices/{deviceId}` | signed in |
| Sending | `GET /notifications/audiences`, `POST /notifications`, `GET /notifications/sent` | teachers, CRs, department admins |
| Department setup | `/department`, `/batches`, `/sections`, `/courses`, `/teachers`, `/students` (with `/import` and `/{id}/class-representative`), `/offerings`, `/routines` | department admin, limited to their department |
| Venues | `GET /buildings`, `GET /rooms`; writes on both | anyone signed in reads; department admins write |

## Conventions

- **JSON in camelCase.** Dates are `YYYY-MM-DD`, times `HH:mm` in campus time
  (Asia/Dhaka), and timestamps ISO 8601 with an offset.
- **Bangladeshi numbers** are accepted as `01712345678`, `1712345678`,
  `8801712345678` or `+8801712345678` (spaces and dashes allowed), and returned in E.164 (`+8801712345678`).
- **Rate limits** apply to code requests and verifications (per IP), to class
  changes and to sending (per person). Over a limit you get `429 RATE_LIMITED`.
- **Updates.** `PATCH` changes only the fields sent. A routine slot is replaced
  whole with `PUT`.

See [Authentication](./authentication) for the sign-in and session flow.
