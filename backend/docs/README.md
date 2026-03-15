# Quad Backend Documentation

This directory contains focused documentation for the Quad backend (API server + Socket.IO).

## 📁 Documentation Structure

| File / Section | Description |
|---|---|
| **[API Reference](./api/README.md)** | All REST endpoints, auth requirements, request/response schemas |
| **[Architecture](./ARCHITECTURE.md)** | Server bootstrap, middleware chain, routing overview |
| **[Domain Map](./DOMAIN_MAP.md)** | Routes → Controllers → Services → Models quick reference |
| **[Domain Walkthroughs](./domains/README.md)** | Deep-dive internal flows per feature area |
| **[Realtime Spec](./REALTIME_SPEC.md)** | Socket.IO events, rooms, and payloads |
| **[Rate Limiting](./RATE_LIMITING.md)** | Rate limiter configuration and mount points |
| **[Observability](./OBSERVABILITY.md)** | Logging, request IDs, error tracking |
| **[Uploads Pipeline](./UPLOADS_PIPELINE.md)** | Multer + Cloudinary implementation details |
| **[Auth & Webhooks](./WEBHOOKS_AND_AUTH.md)** | Clerk middleware + webhook event processing |
| **[Deployment](./deployment/README.md)** | Production deployment guide |
| **[Development](./development/README.md)** | Local development setup |

### Related

- **[Shared Docs Hub](../../docs/README.md)** — Full-stack architecture, deployment, env vars, and audits
- **[Frontend Docs](../../frontend/docs/README.md)** — Frontend technical reference

---

## 🚀 Quick Start

```bash
# From the backend/ directory

cp .env.example .env
# Fill in MONGODB_URI, CLERK_*, CLOUDINARY_*, etc.

npm install
npm run dev
```

Server starts on port `4000` (configurable via `PORT` env var).

**Available endpoints after startup:**
- `http://localhost:4000/health` — basic health check
- `http://localhost:4000/api-docs` — interactive Swagger UI
- `http://localhost:4000/api/*` — REST API

---

## 🏗️ Architecture Overview

- **Framework**: Express.js (v5) + TypeScript
- **Database**: MongoDB via Mongoose ODM
- **Authentication**: Clerk (`clerkMiddleware` on all routes + `requireApiAuth` per route)
- **Real-time**: Socket.IO (authenticated via Clerk JWT on connect)
- **Media Storage**: Cloudinary (via upload endpoints)
- **Validation**: Zod schemas (request/body/params/query)
- **API Docs**: Swagger UI at `/api-docs`

### Startup sequence

1. Connect to MongoDB (`connectDB()`)
2. Ensure database indexes (`ensureIndexes()`)
3. Start poll expiry cron job (`startPollExpiryJob()`)
4. Log CORS configuration
5. Start HTTP server and listen on `PORT`

### Graceful shutdown

On `SIGTERM` / `SIGINT`:
1. Stop accepting new HTTP connections
2. Close Socket.IO
3. Close MongoDB connection
4. Force exit after 10 seconds if still hanging

---

## 📊 Key Features

- ✅ **Social Content** — Posts, Stories (draft + published), Polls (with auto-expiry)
- ✅ **User Management** — Profiles, follow/unfollow, Clerk-backed auth
- ✅ **Global Chat** — Real-time messaging with edit/delete
- ✅ **Notifications** — Real-time per-user notification rooms
- ✅ **Feed** — Following and For You algorithm
- ✅ **Engagement** — Comments (with threading + likes), Reactions (`love` type)
- ✅ **Bookmarks** — Save posts, stories, or polls
- ✅ **Media Uploads** — Images/videos for posts, stories, polls, avatars, covers
- ✅ **Webhooks** — Clerk user lifecycle (create/update/delete with cascade)

---

## 🔧 Development Guidelines

- **Error Handling**: Use `AppError` for operational errors; unexpected errors are captured by `errorTracker`
- **Logging**: Use `logger` from `src/utils/logger.util.ts` (do not use `console.log`)
- **Database**: Avoid N+1 queries; use lean queries and batched lookups where possible
- **Realtime**: Emit socket events from services using `getSocketIO()`; do not import `io` directly
- **Security**: Apply `requireApiAuth` to all protected routes; validate all inputs with Zod

---

## 📞 Support

For questions or issues, refer to the specific documentation sections above or open an issue in the repository.
