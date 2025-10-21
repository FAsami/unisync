# API Reference

Unisync provides a REST API for authentication and OTP operations, along with a GraphQL API powered by Hasura for data operations.

## REST API

### Base URL

```
http://localhost:9201/api/v1
```

### Endpoints

#### Health Check

```http
GET /api/v1/health
```

Returns the server status and uptime information.

**Response:**

```json
{
  "data": {
    "status": "OK",
    "uptime": 123.456,
    "environment": "development",
    "version": "1.0.0"
  },
  "meta": {
    "message": "Server is healthy",
    "timestamp": "2025-10-19T12:34:56.789Z",
    "duration": 5
  }
}
```

#### Generate Guest Session

```http
POST /api/v1/auth/session/guest
```

Creates a guest session and returns access and refresh tokens.

**Response:**

```json
{
  "data": {
    "session_id": "uuid",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2025-10-19T13:34:56.789Z",
    "user_type": "guest"
  },
  "meta": {
    "message": "Guest session created successfully",
    "timestamp": "2025-10-19T12:34:56.789Z"
  }
}
```

#### Refresh Tokens

```http
POST /api/v1/auth/session/refresh
Content-Type: application/json
Authorization: Bearer <refresh_token>

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Refreshes the access and refresh tokens.

**Response:**

```json
{
  "data": {
    "session_id": "uuid",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2025-10-19T13:34:56.789Z",
    "user_type": "user"
  },
  "meta": {
    "message": "Tokens refreshed successfully",
    "timestamp": "2025-10-19T12:34:56.789Z"
  }
}
```

#### Send OTP

```http
POST /api/v1/otp/send
Content-Type: application/json

{
  "input": {
    "identifier": "user@example.com",
    "identifierType": "EMAIL",
    "purpose": "LOGIN"
  }
}
```

**Parameters:**

- `identifier` (string): Email address or phone number
- `identifierType` (string): Either "EMAIL" or "PHONE"
- `purpose` (string): One of "LOGIN", "SIGNUP", or "PASSWORD_RESET"

**Response:**

```json
{
  "data": {
    "message": "OTP sent successfully to email",
    "otpId": "uuid",
    "expiresAt": "2025-10-19T12:39:56.789Z"
  },
  "meta": {
    "message": "OTP created successfully",
    "timestamp": "2025-10-19T12:34:56.789Z"
  }
}
```

**Note:** OTP verification is handled through specific authentication endpoints:

- For registration: `/api/v1/auth/register/verify`
- For password reset: `/api/v1/auth/reset-password/verify`
- For login: Use `/api/v1/auth/login` with phone + password

#### Register User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "phone": "+15555550123",
  "password": "P@ssw0rd!",
  "email": "user@example.com"  // optional
}
```

Creates a new user account. The password is hashed and stored. After registration, send an OTP using `/otp/send` with `purpose: "SIGNUP"`, then verify using the endpoint below.

**Response:**

```json
{
  "data": {
    "userId": "uuid"
  },
  "meta": {
    "message": "Registration initiated. Please verify OTP.",
    "timestamp": "2025-10-21T12:34:56.789Z"
  }
}
```

#### Verify Registration

```http
POST /api/v1/auth/register/verify
Content-Type: application/json

{
  "phone": "+15555550123",
  "otp": "123456"
}
```

Verifies the OTP code for registration and returns authentication tokens.

**Response:**

```json
{
  "data": {
    "insert_user_session_one": {
      "id": "session-uuid",
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "access_token_expires_at": "2025-10-21T13:34:56.789Z",
      "refresh_token_expires_at": "2025-11-20T12:34:56.789Z"
    }
  },
  "meta": {
    "message": "Registration verified successfully",
    "timestamp": "2025-10-21T12:34:56.789Z"
  }
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "phone": "+15555550123",
  "password": "P@ssw0rd!"
}
```

Authenticates a user with phone and password.

**Response:**

```json
{
  "data": {
    "session_id": "uuid",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "role": "consumer"
  },
  "meta": {
    "message": "Login successful",
    "timestamp": "2025-10-21T12:34:56.789Z"
  }
}
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

Revokes the current session.

**Response:**

```json
{
  "meta": {
    "message": "Logout successful",
    "timestamp": "2025-10-21T12:34:56.789Z"
  }
}
```

#### Reset Password Request

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "phone": "+15555550123"
}
```

Initiates a password reset by sending an OTP. Always returns success to prevent user enumeration.

**Response:**

```json
{
  "meta": {
    "message": "If this phone number exists, an OTP has been sent",
    "timestamp": "2025-10-21T12:34:56.789Z"
  }
}
```

#### Reset Password Verify

```http
POST /api/v1/auth/reset-password/verify
Content-Type: application/json

{
  "phone": "+15555550123",
  "otp": "123456",
  "newPassword": "N3wP@ssw0rd!"
}
```

Verifies the OTP and sets a new password. Revokes all existing sessions for the user.

**Response:**

```json
{
  "meta": {
    "message": "Password reset successful",
    "timestamp": "2025-10-21T12:34:56.789Z"
  }
}
```

#### Hasura Authorization Webhook

```http
POST /api/v1/auth/webhook/authorize
```

Internal endpoint used by Hasura to authorize GraphQL requests. Not intended for direct use.

## GraphQL API

### Hasura Console

The Hasura GraphQL API is accessible at:

```
http://localhost:9203/v1/graphql
```

### GraphQL Playground

You can explore the API interactively using the Hasura Console:

```
http://localhost:9203/console
```

**Admin Secret:** `123`

### Schema

The GraphQL schema is automatically generated from the PostgreSQL database with the following schemas:

- **user**: User sessions
- **platform**: OTP transactions and rate limiting
- **settings**: Application configuration

## Rate Limiting

OTP endpoints are rate-limited to prevent abuse:

- **Send OTP**: 3 requests per hour per identifier
- **Send OTP (per IP)**: 10 requests per hour
- **Verify OTP**: 5 requests per 15 minutes

## Error Handling

All API responses follow a consistent format:

### Success Response

```json
{
  "data": {
    /* response data */
  },
  "meta": {
    "message": "Success message",
    "timestamp": "2025-10-19T12:34:56.789Z",
    "duration": 5
  }
}
```

### Error Response

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": null
  },
  "meta": {
    "timestamp": "2025-10-19T12:34:56.789Z",
    "path": "/api/v1/otp/send",
    "method": "POST"
  }
}
```

### Common Error Codes

- `INVALID_REQUEST`: Request format is invalid
- `MISSING_FIELDS`: Required fields are missing
- `INVALID_IDENTIFIER`: Email or phone number format is invalid
- `INVALID_OTP`: OTP code is incorrect
- `OTP_EXPIRED`: OTP has expired
- `OTP_ALREADY_USED`: OTP has already been verified
- `MAX_ATTEMPTS_REACHED`: Maximum verification attempts exceeded
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SESSION_NOT_FOUND`: Session does not exist
- `SESSION_REVOKED`: Session has been revoked

## Next Steps

- [Authentication Guide](/api/authentication)
