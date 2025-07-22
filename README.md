# UniSync

A full-stack application with mobile app, server API, and Hasura GraphQL.

## Project Structure

```
unisync/
├── mobile/          # React Native/Expo app
├── server/          # Node.js/Express API
├── hasura/          # GraphQL API
├── web/             # Web app (empty)
└── docker-compose.yml
```

## Quick Start

### Start Backend Services

```bash
docker-compose up -d
```

Services:

- PostgreSQL: localhost:9200
- Hasura: http://localhost:9203 (admin secret: 123)

### Start API Server

```bash
cd server
npm install
npm run dev
```

Server runs on port 9201.

### Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

## API Endpoints

### Health Check

- `GET /api/v1/health` - Server health status

### Authentication

- `POST /api/v1/auth/guest-session` - Generate guest token
- `POST /api/v1/auth/webhook/authorize` - Hasura auth webhook

## Database Schema

### user.session table

- `id` (uuid, primary key)
- `user_id` (integer)
- `access_token` (text, unique)
- `access_token_expires_at` (timestamptz)
- `refresh_token` (text, unique)
- `refresh_token_expires_at` (timestamptz)
- `revoked` (boolean, default false)
- `ip_address` (text)
- `device_info` (jsonb)
- `user_agent` (text)
- `last_used_at` (timestamptz)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## Development

### Server

- TypeScript
- Express.js
- Jest testing
- Winston logging
- Sentry error tracking

### Mobile

- React Native with Expo
- File-based routing
- TypeScript

### Hasura

- GraphQL API
- PostgreSQL backend
- Webhook authentication
