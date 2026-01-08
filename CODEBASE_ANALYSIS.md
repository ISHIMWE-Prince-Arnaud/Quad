# Quad Codebase Analysis

## Overview
Quad is a modern full-stack social entertainment platform designed for students. The project follows a monorepo-style structure with separate `backend` and `frontend` directories.

## Tech Stack

### Backend
- **Framework:** Express 5.1.0 (TypeScript)
- **Database:** MongoDB via Mongoose 8.19.3
- **Authentication:** Clerk (@clerk/express)
- **Real-time:** Socket.IO 4.8.1
- **File Storage:** Cloudinary
- **Validation:** Zod
- **Other:** Rate limiting, cron jobs for poll expiry, and custom logging.

### Frontend
- **Library:** React 19.2.0 (Vite)
- **State Management:** Zustand
- **Routing:** React Router 7.9.5
- **Styling:** Tailwind CSS with Radix UI primitives and Framer Motion
- **Form Handling:** React Hook Form + Zod
- **Rich Text:** Tiptap
- **Testing:** Vitest

## Architecture
- **Backend:** Controller-Route-Service pattern (though services seem integrated into controllers or utils in some places). Clear separation of concerns with middlewares for auth, caching, and rate limiting.
- **Frontend:** Component-based architecture with hooks for logic, Zustand for global state, and services for API communication.
- **Real-time:** Dedicated socket handlers for chat, feed, and notifications.

## Key Observations
- The project uses modern versions of most libraries.
- Comprehensive documentation exists in `docs/` and `backend/docs/`.
- Ready for production with rate limiting and security audits.
