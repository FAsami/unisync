# UniSync

A full-stack synchronization platform built with React Native, Node.js, Hasura GraphQL, and PostgreSQL.

## 🏗️ Architecture

```
unisync/
├── mobile/          # React Native/Expo app
├── server/          # Node.js/Express API
├── hasura/          # GraphQL API
├── web/             # Web app (future)
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Expo CLI (`npm install -g @expo/cli`)

### 1. Start Backend Services

```bash
# Start PostgreSQL and Hasura
docker-compose up -d
```

**Services:**

- PostgreSQL: `localhost:9200`
- Hasura Console: `http://localhost:9203` (admin secret: `123`)

### 2. Start API Server

```bash
cd server
npm install
npm run dev
```

Server runs on port `9201`.

### 3. Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

## 📁 Project Components

### [Server API](./server/README.md)

Node.js/Express API server with TypeScript, authentication, and GraphQL integration.

**Key Features:**

- REST API endpoints
- JWT authentication
- Hasura webhook integration
- Comprehensive testing with Jest
- Structured logging with Winston

### [Hasura GraphQL](./hasura/README.md)

GraphQL API layer with PostgreSQL backend and real-time capabilities.

**Key Features:**

- Auto-generated GraphQL API
- Database migrations
- Authentication webhooks
- Real-time subscriptions
- Admin console

### Mobile App

React Native application with Expo for cross-platform development.

**Key Features:**

- File-based routing
- TypeScript support
- Cross-platform compatibility
- Hot reload development

## 🔧 Development

### Environment Setup

1. **Database Setup**

   ```bash
   cd hasura
   hasura migrate apply
   hasura metadata apply
   ```

2. **Code Generation**

   ```bash
   cd server
   npm run codegen
   ```

3. **Testing**
   ```bash
   cd server
   npm test
   ```

### Development Workflow

- **Server**: TypeScript with hot reload
- **Mobile**: Expo development server
- **Database**: Hasura console for schema management
- **Testing**: Jest for unit and integration tests

## 📊 Current Status

### ✅ Implemented

- Basic server API with health check and authentication
- Hasura GraphQL setup with user session management
- Mobile app structure with Expo
- Docker infrastructure
- Database schema for user sessions

### 🚧 In Progress

- Authentication system refinement
- Mobile app features
- API endpoint expansion

### 📋 Planned

- Web application
- Real-time synchronization
- Advanced user management
- Performance monitoring

## 🔗 Links

- [Server Documentation](./server/README.md)
- [Hasura Documentation](./hasura/README.md)
- [Mobile App](./mobile/) (uses default Expo README)

## 📞 Support

- **Contact**: foysal.developer@gmail.com

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
