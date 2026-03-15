# Backend Architecture

This document explains the current backend architecture as implemented in the codebase.

## Entry point

- `backend/src/server.ts`

Responsibilities:

- Creates an Express app
- Applies global middleware (Helmet, CORS, request logging)
- Mounts:
  - `GET /health`
  - `GET /api-docs` (Swagger UI)
  - `POST /api/webhooks/*` (Clerk webhooks; raw body handling)
  - `clerkMiddleware()` for auth context
  - `/api/*` API router
- Applies centralized `errorHandler`
- Creates an HTTP server
- Attaches Socket.IO to the HTTP server
- Registers socket domain handlers
- Connects to MongoDB and starts background jobs

## Express middleware chain (high level)

Order (see `server.ts`):

1. `helmet()`
2. `cors(corsOptions)` — options from `backend/src/config/cors.config.ts`
3. `requestLogger` — from `backend/src/middlewares/requestLogger.middleware.ts`
4. `/api-docs` (Swagger UI) — served before body parsing
5. `/health` routes — no auth, before body parsing
6. `/api/webhooks` routes — raw body parsing (required by Svix Clerk signature verification)
7. `express.json({ limit: "1mb" })` — body parsing for all other routes
8. `clerkMiddleware()` — attaches Clerk auth context to `req.auth`
9. `/api` routes — via `backend/src/routes/index.ts`
10. `GET /` — simple "API is running" test response
11. `errorHandler` — from `backend/src/middlewares/error.middleware.ts`

Note: Socket.IO uses a **separate auth middleware** that verifies Clerk JWT via `verifyToken()` before any socket handler runs.

## API routing

The main API router is defined in:

- `backend/src/routes/index.ts`

It mounts domain routers under `/api`:

- `/users`
- `/posts`
- `/stories`
- `/polls`
- `/chat`
- `/profile`
- `/follow`
- `/notifications`
- `/feed`
- `/reactions`
- `/comments`
- `/bookmarks`
- `/upload`

### Rate limiting

- **General**: applied to the entire `/api` router via `generalRateLimiter` in `routes/index.ts`.
- **Write operations**: applied to write-heavy routers via `writeRateLimiter` in `routes/index.ts`.
- **Uploads**: applied to the `/upload` router via `uploadRateLimiter` in `routes/index.ts`.
- **Auth**: `authRateLimiter` is applied directly inside `user.routes.ts` on `POST /users` (route-level, not in `routes/index.ts`).

## Error handling

Central error handling:

- `backend/src/middlewares/error.middleware.ts`

Behavior:

- Uses `AppError` to distinguish operational errors.
- Adds `requestId` to responses when available.
- Captures server errors (or non-AppError) via `errorTracker`.
- Includes stack traces in development mode.

## Request logging + request IDs

- `backend/src/middlewares/requestLogger.middleware.ts`

Behavior:

- Skips logging for `/health`.
- Accepts `x-request-id` if provided, else generates one.
- Attaches `req.requestId` and echoes `x-request-id` in the response.
- Logs based on status code severity.

## CORS

- `backend/src/config/cors.config.ts`

Behavior:

- Development: allow all origins (callback returns true).
- Production: requires `FRONTEND_URL` to be set; otherwise blocks all.

Also provides Socket.IO CORS options via `getSocketCorsOptions()`.

## Swagger/OpenAPI

- Config: `backend/src/config/swagger.config.ts`
- UI served at: `GET /api-docs`

## Realtime (Socket.IO)

Socket.IO is initialized in `backend/src/server.ts` and handlers are registered from:

- `backend/src/sockets/chat.socket.ts`
- `backend/src/sockets/notification.socket.ts`
- `backend/src/sockets/feed.socket.ts`

See: `backend/docs/realtime/README.md` for backend realtime documentation.
