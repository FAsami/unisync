# Server API

Node.js/Express API server with TypeScript.

## Endpoints

### Health Check

- `GET /api/v1/health` - Returns server status, uptime, environment, and version

### Authentication

- `POST /api/v1/auth/guest-session` - Generate guest token
- `POST /api/v1/auth/webhook/authorize` - Hasura authentication webhook

## Development

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run codegen` - Generate GraphQL types

## Configuration

Environment variables:

- `PORT` - Server port (default: 9201)
- `NODE_ENV` - Environment (development/production)

## Dependencies

- Express.js
- TypeScript
- Jest (testing)
- Winston (logging)
- Sentry (error tracking)
- GraphQL client
