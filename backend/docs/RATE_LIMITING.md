# Rate Limiting

This document describes the current rate limiting implementation in the backend.

## Implementation

- Middleware: `backend/src/middlewares/rateLimiter.middleware.ts`
- Library: `express-rate-limit`

## Limiters

### `generalRateLimiter`

- Applied to **all** API routes via `router.use(generalRateLimiter)` in `backend/src/routes/index.ts`.
- Window: `env.RATE_LIMIT_GENERAL_WINDOW_MS`
- Max: `env.RATE_LIMIT_GENERAL_MAX` (in development: very high)

### `writeRateLimiter`

- Applied to write-heavy routers in `backend/src/routes/index.ts`:
  - `/posts`
  - `/stories`
  - `/polls`
  - `/chat`
  - `/follow`
  - `/reactions`
  - `/comments`
  - `/bookmarks`

- Window: `env.RATE_LIMIT_WRITE_WINDOW_MS`
- Max: `env.RATE_LIMIT_WRITE_MAX`

### `uploadRateLimiter`

- Applied to `/upload` routes.
- Window: `env.RATE_LIMIT_UPLOAD_WINDOW_MS`
- Max: `env.RATE_LIMIT_UPLOAD_MAX`

### `authRateLimiter`

- Defined but not currently mounted in `backend/src/routes/index.ts`.
- Window: `env.RATE_LIMIT_AUTH_WINDOW_MS`
- Max: `env.RATE_LIMIT_AUTH_MAX`

## Response format

When rate limits are exceeded, the server responds with HTTP `429`:

- `success: false`
- `message: string`
- `retryAfter: number` (seconds)

## Configuration

Rate limit values are validated in:

- `backend/src/config/env.config.ts`

Environment variables:

- `RATE_LIMIT_GENERAL_WINDOW_MS`
- `RATE_LIMIT_GENERAL_MAX`
- `RATE_LIMIT_UPLOAD_WINDOW_MS`
- `RATE_LIMIT_UPLOAD_MAX`
- `RATE_LIMIT_AUTH_WINDOW_MS`
- `RATE_LIMIT_AUTH_MAX`
- `RATE_LIMIT_WRITE_WINDOW_MS`
- `RATE_LIMIT_WRITE_MAX`
