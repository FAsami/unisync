# Authentication

Sign-in is passwordless and limited to the roster. A person signs in with the
mobile number their department registered, plus a one-time code sent to it by
SMS. There are no passwords, no self-registration and no guest sessions.

## Sign in

### 1. Ask for a code

```http
POST /api/v1/auth/code
Content-Type: application/json

{ "phone": "01712345678" }
```

`data` is `{ "phone": "+8801712345678", "expiresInSeconds": 300 }`.

| Error | When |
| --- | --- |
| `INVALID_PHONE` | Not a Bangladeshi mobile number |
| `PHONE_NOT_REGISTERED` | No active account has this number. The apps offer **Request access**. |
| `TOO_MANY_CODES` | Three codes per number per hour |
| `RATE_LIMITED` | Too many requests from this IP |
| `SMS_FAILED` | The SMS gateway refused |

### 2. Verify it

```http
POST /api/v1/auth/verify
Content-Type: application/json

{ "phone": "01712345678", "code": "123456" }
```

`data` is the token pair:

```json
{
  "sessionId": "…",
  "accessToken": "eyJ…",
  "accessTokenExpiresAt": "2026-11-08T10:00:00+00:00",
  "refreshToken": "eyJ…",
  "refreshTokenExpiresAt": "2026-12-08T09:00:00+00:00",
  "role": "student"
}
```

- Codes are six digits and expire after five minutes.
- A code allows five wrong guesses.
- A code is used up the moment it's accepted, and it only works for the purpose
  it was sent for: a sign-in code can't complete an access request.
- Errors: `INVALID_CODE`, `CODE_EXPIRED`, `TOO_MANY_ATTEMPTS`.

### 3. Call the API

Send the access token as a bearer token:

```http
GET /api/v1/me
Authorization: Bearer eyJ…
```

Every authenticated request re-checks the session in the database. A revoked
session, a deactivated person or a deleted account is refused immediately with
`401 SESSION_REVOKED`, without waiting for the token to expire.

## Refresh

Access tokens last one hour and refresh tokens 30 days. On `401 TOKEN_EXPIRED`:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJ…" }
```

The response is a new token pair, and both tokens rotate. Using a refresh token
that has already been used revokes the whole session (replay protection), so
clients must run only one refresh at a time. The mobile session module and the
web server both do.

## Sign out

```http
POST /api/v1/auth/logout
Authorization: Bearer eyJ…
Content-Type: application/json

{ "deviceId": "<install id>" }
```

This revokes the session. With `deviceId`, that device's push registration is
also turned off, so the phone stops receiving the account's notices.

## Request access (numbers not on a roster)

1. `POST /api/v1/access-requests/code` with `{ "phone" }` sends a code for this purpose only.
2. `GET /api/v1/directory` lists the open departments, batches and sections to choose from.
3. `POST /api/v1/access-requests` with
   `{ "phone", "code", "firstName", "lastName", "studentId", "sectionId" }`
   creates a pending request (`201`). Errors include `REQUEST_PENDING`,
   `ALREADY_REGISTERED`, `STUDENT_ID_TAKEN` and `INVALID_SECTION`.
4. The department admin approves or rejects it in the dashboard
   (`GET /access-requests`, `POST /access-requests/{id}/approve` or `/reject`).
   Approval creates the student account. The person then signs in normally.

## Roles

| Role | Notes |
| --- | --- |
| `student` | On a section's roster. A student may carry the **CR mark** (`isClassRepresentative` on `/me`). |
| `teacher` | Created by a department admin |
| `admin` | A department admin: role `admin` plus the department they manage. Created only by the `create-admin` command, which is how a department's first admin is made. |

`GET /me` returns the person's id, phone, role, names, student ID, department,
batch, section and CR mark. `DELETE /me` deletes the account. It's a soft delete:
every session is revoked and every device turned off.

## Tokens

Tokens are HS256 JWTs signed with `Auth:JwtSecret`. They carry `sessionId`,
`userId`, `role`, `typ` (`access` or `refresh`) and a unique `jti`. A refresh
token is never accepted as an access token. The format is the same one the old
Node server used, so existing sessions survive the switch as long as the secret
stays the same.
