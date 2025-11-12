# Quad Backend Documentation

This directory contains comprehensive documentation for the Quad social media platform backend.

## 📁 Documentation Structure

- **[API Reference](./api/README.md)** - Complete API endpoint documentation
- **[Database Schema](./database/README.md)** - MongoDB models and relationships
- **[Authentication](./auth/README.md)** - Clerk authentication integration
- **[Real-time Features](./realtime/README.md)** - Socket.IO implementation
- **[File Upload](./upload/README.md)** - Cloudinary media handling
- **[Search System](./search/README.md)** - MongoDB text search implementation
- **[Deployment](./deployment/README.md)** - Production deployment guide
- **[Development](./development/README.md)** - Local development setup

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
- **Search**: MongoDB text search with advanced features

## 📊 Key Features

- ✅ **Social Media Core** - Posts, Stories, Polls
- ✅ **User Management** - Profiles, following, authentication
- ✅ **Real-time Chat** - Messaging with reactions and typing indicators
- ✅ **Notifications** - Real-time notification system
- ✅ **Feed Algorithm** - Following and For You feeds
- ✅ **Advanced Search** - Full-text search with filters and analytics
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
