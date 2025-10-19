# Installation

This guide will walk you through setting up Unisync on your local development environment.

## Clone the Repository

```bash
git clone https://github.com/yourusername/unisync.git
cd unisync
```

## Install Dependencies

Unisync uses Yarn for dependency management. Install dependencies for each component:

```bash
# Install root dependencies
yarn install

# Install server dependencies
cd server
yarn install

# Install mobile dependencies
cd ../mobile
yarn install
```

## Set Up Environment Variables

### Server

Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/unisync
HASURA_GRAPHQL_ADMIN_SECRET=your_admin_secret
JWT_SECRET=your_jwt_secret
```

### Mobile

Configure your environment in `mobile/app.config.js` or create a `.env` file as needed.

## Start the Services

### Using Docker Compose

Start Hasura and PostgreSQL:

```bash
docker-compose up -d
```

### Start the Server

```bash
cd server
yarn dev
```

### Start the Mobile App

```bash
cd mobile
yarn start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code for physical device

## Verify Installation

1. Visit `http://localhost:3000` to check the server
2. Visit `http://localhost:8080` for Hasura Console
3. The mobile app should be running on your simulator/emulator

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Find the process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

Make sure PostgreSQL is running and accessible:

```bash
docker ps
```

You should see containers for Hasura and PostgreSQL running.

## Next Steps

Continue exploring the documentation to learn more about using Unisync.
