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
2. `cors(corsOptions)` where `corsOptions` comes from `backend/src/config/cors.config.ts`
3. `requestLogger` (`backend/src/middlewares/requestLogger.middleware.ts`)
4. `/health` routes
5. `/api-docs` swagger
6. `/api/webhooks` routes
7. `express.json()` for other routes
8. `clerkMiddleware()`
9. `/api` routes (`backend/src/routes/index.ts`)
10. fallback `/` test route
11. `errorHandler` (`backend/src/middlewares/error.middleware.ts`)

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

Rate limiting is applied at 3 levels:

- **General**: applied to the entire `/api` router via `generalRateLimiter`.
- **Write operations**: applied to write-heavy routers via `writeRateLimiter`.
- **Uploads**: applied to upload router via `uploadRateLimiter`.

Implementation:

- `backend/src/middlewares/rateLimiter.middleware.ts`

Config:

- Values are sourced from env via `backend/src/config/env.config.ts`:
  - `RATE_LIMIT_GENERAL_*`
  - `RATE_LIMIT_WRITE_*`
  - `RATE_LIMIT_UPLOAD_*`
  - `RATE_LIMIT_AUTH_*` (defined but not currently mounted in `routes/index.ts`)

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
