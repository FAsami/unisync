# Getting Started

Welcome to the Unisync documentation! This guide will help you get started with the project.

## What is Unisync?

Unisync is a full-stack application consisting of a mobile app (iOS/Android), REST API server, and GraphQL backend powered by Hasura.

## Architecture Overview

The Unisync project consists of the following components:

### Server (REST API)

- **Technology**: Node.js with Express and TypeScript
- **Port**: 9201
- **Features**:
  - User registration with OTP verification
  - Phone + password authentication
  - Password reset with OTP
  - Guest session generation
  - JWT token management (access and refresh)
  - Hasura webhook authorization
  - Rate limiting for OTP endpoints
  - Error tracking with Sentry
  - Logging with Winston

### Mobile App

- **Framework**: React Native with Expo
- **Platforms**: iOS and Android
- **UI Library**: React Native Paper
- **Navigation**: Expo Router
- **GraphQL Client**: Apollo Client
- **Features**: Home, Schedule, Tasks, Announcements, Account screens

### Hasura (GraphQL Engine)

- **Port**: 9203
- **Admin Console**: http://localhost:9203/console (admin secret: `123`)
- **Features**:
  - GraphQL API with PostgreSQL
  - Authentication via webhook to server
  - Database migrations and metadata management

### PostgreSQL Database

- **Port**: 9200
- **Database Name**: unisync
- **Schemas**:
  - `user`: User sessions
  - `platform`: OTP transactions and rate limiting
  - `settings`: Application configuration

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v18 or higher)
- Yarn package manager
- Docker and Docker Compose
- Xcode (for iOS development)
- Android Studio (for Android development)

## Key Documentation

### Installation & Setup

- [Installation Guide](/guide/installation) - Complete setup instructions
- [Provider Configuration](/guide/providers) - Configure SMS/Email OTP providers

### Admin Dashboard

- [Admin Dashboard Guide](/guide/admin-dashboard-guide) - Manage instructors, routines, and exam schedules

### API & Authentication

- [Authentication Guide](/api/authentication) - JWT and OTP authentication flows
- [API Reference](/api/) - Complete REST and GraphQL API documentation

## Next Steps

1. [Install and configure](/guide/installation) the backend services
2. [Set up SMS provider](/guide/providers) for OTP delivery
3. Review the [authentication flow](/api/authentication) documentation
