# Authentication

Unisync uses JWT (JSON Web Tokens) for authentication with OTP (One-Time Password) verification for user authentication, and supports guest sessions for unauthenticated access.

## Authentication Methods

### 1. Guest Session (Unauthenticated Access)

For users who don't need to authenticate, you can create a guest session.

### 2. OTP Authentication (User Login)

For authenticated users, use the OTP flow to verify identity via email or SMS.

## Guest Session Flow

Create a guest session to get access tokens without authentication:

```http
POST /api/v1/auth/guest-session
```

**Response:**

```json
{
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
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

## OTP Authentication Flow

The OTP authentication process consists of two steps:

### Step 1: Send OTP

Request an OTP to be sent to the user's email or phone:

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

- `identifier` (string, required): Email address or phone number
- `identifierType` (string, required): `"EMAIL"` or `"PHONE"`
- `purpose` (string, required): `"LOGIN"`, `"SIGNUP"`, or `"PASSWORD_RESET"`

**Response:**

```json
{
  "data": {
    "message": "OTP sent successfully to email",
    "otpId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2025-10-19T12:39:56.789Z"
  },
  "meta": {
    "message": "OTP created successfully",
    "timestamp": "2025-10-19T12:34:56.789Z"
  }
}
```

### Step 2: Verify OTP

Verify the OTP code sent to the user:

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

- `identifier` (string, required): The same identifier used in send request
- `otp` (string, required): The 6-digit OTP code
- `purpose` (string, required): The same purpose used in send request

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

**Note:** The current implementation verifies the OTP but does not automatically create a session. After successful OTP verification, you should implement your own session creation logic based on your application's requirements.

## Using JWT Tokens

After obtaining tokens (via guest session or OTP verification + session creation), include the access token in API requests:

### GraphQL Requests

```http
POST /v1/graphql
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "query": "query { user_session { id user_id } }"
}
```

### REST Requests

```http
GET /api/v1/protected-endpoint
Authorization: Bearer <access_token>
```

## Refresh Tokens

When the access token expires, use the refresh token to get new tokens:

```http
POST /api/v1/auth/refresh
Content-Type: application/json
Authorization: Bearer <refresh_token>

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "data": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
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

## Token Configuration

Default token expiration times (configurable via environment variables):

- **Access Token**: 1 hour (default)
- **Refresh Token**: 30 days (default)
- **OTP Code**: 5 minutes

## OTP Configuration

- **OTP Length**: 6 digits
- **Max Verification Attempts**: 5 attempts
- **Rate Limits**:
  - Send OTP: 3 requests per hour per identifier
  - Send OTP per IP: 10 requests per hour
  - Verify OTP: 5 requests per 15 minutes

## Security Best Practices

1. **Store tokens securely**: Use secure storage mechanisms

   - iOS: Keychain
   - Android: Keystore
   - Web: httpOnly cookies or secure storage libraries

2. **HTTPS only**: Always use HTTPS in production

3. **Token rotation**: Implement token rotation when refreshing

4. **Logout**: Clear all tokens on logout and revoke session in backend

5. **Rate limiting**: OTP endpoints are rate-limited to prevent abuse

6. **OTP best practices**:
   - OTPs are hashed using bcrypt before storage
   - OTPs expire after 5 minutes
   - Generic error messages prevent user enumeration
   - Failed attempts are tracked and limited

## Error Codes

| Code                   | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `INVALID_REQUEST`      | Request format is invalid                        |
| `MISSING_FIELDS`       | Required fields are missing                      |
| `INVALID_IDENTIFIER`   | Email or phone number format is invalid          |
| `INVALID_PURPOSE`      | Purpose must be LOGIN, SIGNUP, or PASSWORD_RESET |
| `INVALID_OTP`          | OTP code is incorrect                            |
| `INVALID_OTP_FORMAT`   | OTP format is invalid (must be 6 digits)         |
| `OTP_EXPIRED`          | OTP code has expired                             |
| `OTP_ALREADY_USED`     | OTP has already been verified                    |
| `MAX_ATTEMPTS_REACHED` | Maximum verification attempts reached            |
| `OTP_SEND_FAILED`      | Failed to send OTP via email/SMS provider        |
| `RATE_LIMIT_EXCEEDED`  | Too many requests                                |
| `SESSION_NOT_FOUND`    | Session does not exist                           |
| `SESSION_REVOKED`      | Session has been revoked                         |
| `SESSION_MISMATCH`     | Session ID doesn't match token                   |

## Example: Mobile App Implementation

Here's how to implement OTP authentication in a React Native app:

```typescript
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://localhost:9201/api/v1";

// Create guest session
export async function createGuestSession() {
  const response = await axios.post(`${API_URL}/auth/guest-session`);
  const { access_token, refresh_token } = response.data.data;

  await SecureStore.setItemAsync("accessToken", access_token);
  await SecureStore.setItemAsync("refreshToken", refresh_token);

  return response.data.data;
}

// Send OTP
export async function sendOTP(
  identifier: string,
  identifierType: "EMAIL" | "PHONE",
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
) {
  const response = await axios.post(`${API_URL}/otp/send`, {
    input: {
      identifier,
      identifierType,
      purpose,
    },
  });
  return response.data.data;
}

// Verify OTP
export async function verifyOTP(
  identifier: string,
  otp: string,
  purpose: "LOGIN" | "SIGNUP" | "PASSWORD_RESET"
) {
  const response = await axios.post(`${API_URL}/otp/verify`, {
    input: {
      identifier,
      otp,
      purpose,
    },
  });
  return response.data.data;
}

// Refresh tokens
export async function refreshTokens() {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");

  const response = await axios.post(
    `${API_URL}/auth/refresh`,
    { refresh_token: refreshToken },
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  const { access_token, refresh_token } = response.data.data;

  await SecureStore.setItemAsync("accessToken", access_token);
  await SecureStore.setItemAsync("refreshToken", refresh_token);

  return response.data.data;
}

// Get stored access token
export async function getAccessToken() {
  return await SecureStore.getItemAsync("accessToken");
}
```

## OTP Delivery Providers

### SMS Providers

The server supports SMS OTP delivery through database-configured providers:

- **BulkSMS Bangladesh** (`bulksmsbd`): ✅ Fully implemented

For detailed configuration instructions, see the [Provider Configuration Guide](/guide/providers).

### Email Providers

Email OTP delivery is planned but not yet implemented. The system will:

- ✅ Create and store OTP records
- ✅ Validate and verify OTP codes
- ⏳ Skip sending actual emails (coming soon)

For more details about email provider implementation status and configuration, see the [Provider Configuration Guide](/guide/providers).

## Next Steps

- [API Reference](/api/)
- [Installation Guide](/guide/installation)
