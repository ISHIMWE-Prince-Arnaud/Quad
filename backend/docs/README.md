# Quad Backend Documentation

This directory contains comprehensive documentation for the Quad social media platform backend.

## 📁 Documentation Structure

- **[API Reference](./api/README.md)** - Complete API endpoint documentation
- **[Database Schema](./database/README.md)** - MongoDB models and relationships
- **[Authentication](./auth/README.md)** - Clerk authentication integration
- **[Real-time Features](./realtime/README.md)** - Socket.IO implementation
- **[File Upload](./upload/README.md)** - Cloudinary media handling
- **[Architecture](./ARCHITECTURE.md)** - Server bootstrap, middleware chain, routing
- **[Rate Limiting](./RATE_LIMITING.md)** - Current rate limiter configuration and mount points
- **[Observability](./OBSERVABILITY.md)** - Logging, request IDs, error tracking
- **[Domain Map](./DOMAIN_MAP.md)** - Routes → controllers → services → models
- **[Domain Walkthroughs](./domains/README.md)** - Internal flow per feature (route → controller → service → side effects)
- **[Realtime Spec](./REALTIME_SPEC.md)** - Socket.IO events, rooms, payloads
- **[Uploads Pipeline](./UPLOADS_PIPELINE.md)** - Multer + Cloudinary implementation details
- **[Auth & Webhooks](./WEBHOOKS_AND_AUTH.md)** - Clerk middleware + webhook processing
- **[Deployment](./deployment/README.md)** - Production deployment guide
- **[Development](./development/README.md)** - Local development setup

### Related documentation

- **[Shared Docs Hub](../../docs/README.md)** - Full-stack setup, architecture, deployment, and audits.
- **[Shared Troubleshooting](../../docs/TROUBLESHOOTING.md)**
- **[Shared Testing Guide](../../docs/TESTING.md)**
- **[Shared Scripts Reference](../../docs/SCRIPTS.md)**
- **[Frontend Docs Index](../../frontend/docs/README.md)** - Frontend technical reference and user guides.

## 🚀 Quick Start

1. **Environment Setup**

   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Overview

The Quad backend is built with:

- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk for user management
- **Real-time**: Socket.IO for chat and notifications
- **File Storage**: Cloudinary for media uploads
- **Validation**: Zod for request/response validation

## 📊 Key Features

- ✅ **Social Media Core** - Posts, Stories, Polls
- ✅ **User Management** - Profiles, following, authentication
- ✅ **Real-time Chat** - Messaging with reactions and typing indicators
- ✅ **Notifications** - Real-time notification system
- ✅ **Feed Algorithm** - Following and For You feeds
- ✅ **Media Handling** - Image/video uploads with Cloudinary
- ✅ **Comments & Reactions** - Engagement features

## 🔧 Development Guidelines

- **Code Style**: Use TypeScript with strict type checking
- **Error Handling**: All async operations wrapped in try/catch
- **Logging**: Use centralized logger utility (`logger.util.ts`)
- **Database**: Optimize queries to prevent N+1 problems
- **Security**: Input validation and sanitization on all endpoints
- **Testing**: Write unit tests for critical functions

## 📞 Support

For questions or issues, please refer to the specific documentation sections or create an issue in the repository.
