# Installation

This guide will walk you through setting up Unisync on your local development environment.

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher)
- Yarn package manager
- Docker and Docker Compose
- Expo CLI (for mobile development)

## 1. Start Backend Services

Start PostgreSQL and Hasura using Docker Compose:

```bash
docker-compose up -d
```

This will start:

- **PostgreSQL**: Port 9200
- **Hasura Console**: http://localhost:9203/console (admin secret: `123`)

## 2. Set Up the Database

Apply Hasura migrations and metadata:

```bash
cd hasura
hasura migrate apply --database-name default
hasura metadata apply
```

## 3. Configure the Server

Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit the `.env` file with your configuration. Key variables:

```env
NODE_ENV=development
PORT=9201
HASURA_ENDPOINT=http://localhost:9203/v1/graphql
HASURA_ADMIN_SECRET=123
JWT_SECRET=reallySecretKey
JWT_ACCESS_TOKEN_EXPIRY=1h
JWT_REFRESH_TOKEN_EXPIRY=30d

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=5
OTP_LENGTH=6

# Email Provider (console, resend, sendgrid, ses)
EMAIL_PROVIDER=console

# SMS Provider (console, twilio, sns, bulksmsbd)
SMS_PROVIDER=console

# Optional: Sentry Error Tracking
SENTRY_DSN=
```

## 4. Start the Server

Install dependencies and start the server:

```bash
cd server
yarn install
yarn dev
```

The server will run on http://localhost:9201

API endpoint: http://localhost:9201/api/v1

## 5. Start the Mobile App

Configure and start the mobile app:

```bash
cd mobile
yarn install
yarn start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## Verify Installation

### Check Server Health

```bash
curl http://localhost:9201/api/v1/health
```

You should see:

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
    "timestamp": "2025-10-19T...",
    "duration": 5
  }
}
```

### Check Hasura

Visit http://localhost:9203/console and verify you can access the GraphQL console with admin secret `123`.

### Check Database

Verify containers are running:

```bash
docker ps
```

You should see `unisync-postgres` and `unisync-hasura` running.

## Troubleshooting

### Port Already in Use

If port 9201, 9200, or 9203 is already in use:

```bash
# Find the process using the port
lsof -i :9201

# Kill the process
kill -9 <PID>
```

### Docker Issues

If containers fail to start:

```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

### Hasura Migration Issues

If migrations fail:

```bash
cd hasura
hasura migrate status --database-name default
hasura migrate apply --database-name default --skip-execution
```

## Development Workflow

### Running Tests

```bash
cd server
yarn test
```

### GraphQL Code Generation

Generate TypeScript types from GraphQL schema:

```bash
cd server
yarn codegen
```

## Next Steps

- [API Reference](/api/)
- [Authentication Guide](/api/authentication)
