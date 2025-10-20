---
layout: home

hero:
  name: "Unisync"
  text: "Documentation"
  tagline: A full-stack application with mobile app, REST API, and GraphQL backend
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: API Reference
      link: /api/

features:
  - title: 🔐 OTP Authentication
    details: Secure authentication using One-Time Password verification via SMS (email support coming soon)
  - title: 📱 Mobile App
    details: React Native mobile application for iOS and Android built with Expo
  - title: 🔌 REST + GraphQL API
    details: Express REST API with Hasura GraphQL engine for data operations
  - title: 🐘 PostgreSQL Database
    details: Robust database with schemas for users, sessions, and application settings
---

## Quick Start

Get up and running with Unisync in minutes.

```bash
# Start backend services (PostgreSQL + Hasura)
docker-compose up -d

# Start the API server
cd server
yarn install
yarn dev

# Start the mobile app
cd mobile
yarn install
yarn start
```

## Project Structure

Unisync is a monorepo containing:

- **Server**: Node.js REST API with Express and TypeScript
- **Mobile**: React Native mobile application (iOS/Android) using Expo
- **Hasura**: GraphQL engine with PostgreSQL database
- **Docs**: VitePress documentation site

For more information, check out the [Guide](/guide/) section.
