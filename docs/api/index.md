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
POST /api/v1/auth/guest-session
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
POST /api/v1/auth/refresh
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

#### Verify OTP

```http
POST /api/v1/otp/verify
Content-Type: application/json

{
  "input": {
    "identifier": "user@example.com",
    "otp": "123456",
    "purpose": "LOGIN"
  }
}
```

**Parameters:**

- `identifier` (string): Email address or phone number
- `otp` (string): The 6-digit OTP code
- `purpose` (string): One of "LOGIN", "SIGNUP", or "PASSWORD_RESET"

**Response:**

```json
{
  "data": {
    "success": true,
    "message": "OTP verified successfully",
    "verified": true,
    "identifier": "user@example.com",
    "purpose": "LOGIN"
  },
  "meta": {
    "message": "OTP verified successfully",
    "timestamp": "2025-10-19T12:34:56.789Z"
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
