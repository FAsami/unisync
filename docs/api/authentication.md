# Authentication

Unisync uses JWT (JSON Web Tokens) for authentication with OTP (One-Time Password) verification.

## Authentication Flow

1. **Request OTP**: User provides email/phone
2. **Verify OTP**: User enters the OTP code received
3. **Receive JWT**: Server issues JWT tokens on successful verification
4. **Use JWT**: Include JWT in subsequent requests

## Request OTP

Send an OTP to the user's email or phone:

```http
POST /api/auth/otp/request
Content-Type: application/json

{
  "email": "user@example.com",
  "type": "login"
}
```

**Response:**

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

### Parameters

- `email` (string, required): User's email address
- `phone` (string, optional): Alternative to email
- `type` (string, required): Purpose of OTP (`login`, `signup`, `verify`)

## Verify OTP

Verify the OTP code:

```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Using JWT Tokens

Include the access token in the `Authorization` header:

### GraphQL Requests

```http
POST /v1/graphql
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "query": "{ users { id email } }"
}
```

### REST Requests

```http
GET /api/user/profile
Authorization: Bearer <accessToken>
```

## Refresh Tokens

When the access token expires, use the refresh token to get a new one:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Token Expiration

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **OTP Code**: 5 minutes

## Security Best Practices

1. **Store tokens securely**: Use secure storage mechanisms (Keychain on iOS, Keystore on Android)
2. **HTTPS only**: Always use HTTPS in production
3. **Rotate tokens**: Implement token rotation for refresh tokens
4. **Logout**: Clear all tokens on logout
5. **Rate limiting**: OTP requests are rate-limited (5 requests per hour per email)

## Error Codes

| Code                  | Description                     |
| --------------------- | ------------------------------- |
| `INVALID_OTP`         | OTP code is incorrect           |
| `OTP_EXPIRED`         | OTP code has expired            |
| `OTP_NOT_FOUND`       | No OTP found for the identifier |
| `RATE_LIMIT_EXCEEDED` | Too many OTP requests           |
| `INVALID_TOKEN`       | JWT token is invalid or expired |
| `TOKEN_EXPIRED`       | JWT token has expired           |

## Example: React Native Implementation

```typescript
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://localhost:3000/api";

// Request OTP
export async function requestOTP(email: string) {
  const response = await axios.post(`${API_URL}/auth/otp/request`, {
    email,
    type: "login",
  });
  return response.data;
}

// Verify OTP
export async function verifyOTP(email: string, code: string) {
  const response = await axios.post(`${API_URL}/auth/otp/verify`, {
    email,
    code,
  });

  // Store tokens securely
  await SecureStore.setItemAsync(
    "accessToken",
    response.data.tokens.accessToken
  );
  await SecureStore.setItemAsync(
    "refreshToken",
    response.data.tokens.refreshToken
  );

  return response.data;
}

// Get stored access token
export async function getAccessToken() {
  return await SecureStore.getItemAsync("accessToken");
}
```

## Next Steps

Continue exploring the API documentation to learn more about available endpoints and operations.
