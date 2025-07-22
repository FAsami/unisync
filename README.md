# UniSync

A full-stack application with mobile app, server API, and Hasura GraphQL.

## 🏗️ Architecture

```
unisync/
├── mobile/          # React Native/Expo app
├── server/          # Node.js/Express API
├── hasura/          # GraphQL API
├── web/             # Empty directory
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites

- Node.js
- Docker & Docker Compose
- Expo CLI

### 1. Start Backend Services

```bash
docker-compose up -d
```

Services:

- PostgreSQL: localhost:9200
- Hasura: http://localhost:9203 (admin secret: 123)

### 2. Start API Server

```bash
cd server
npm install
npm run dev
```

Server runs on port 9201.

### 3. Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

## 📁 Project Components

### [Server API](./server/README.md)

Node.js/Express API server with TypeScript.

### [Hasura GraphQL](./hasura/README.md)

GraphQL API with PostgreSQL backend.

### Mobile App

React Native application with Expo.

## 🔧 Development

### Environment Setup

1. Database Setup

   ```bash
   cd hasura
   hasura migrate apply
   hasura metadata apply
   ```

2. Code Generation

   ```bash
   cd server
   npm run codegen
   ```

3. Testing
   ```bash
   cd server
   npm test
   ```

## 🔗 Links

- [Server Documentation](./server/README.md)
- [Hasura Documentation](./hasura/README.md)
- [Mobile App](./mobile/)

## 📞 Support

- Contact: foysal.developer@gmail.com
