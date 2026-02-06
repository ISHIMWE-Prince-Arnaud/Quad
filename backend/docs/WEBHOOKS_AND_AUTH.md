# Auth & Webhooks (Backend)

This document describes how authentication and Clerk webhooks are handled in the backend.

## Authentication middleware

The backend uses Clerk:

- Express middleware: `clerkMiddleware()` from `@clerk/express`
- Applied globally in `backend/src/server.ts`:
  - `app.use(clerkMiddleware())`

This attaches auth context to `req.auth`.

### Route-level protection

Most routes also use an additional middleware:

- `requireApiAuth` in `backend/src/middlewares/auth.middleware.ts`

This enforces that the request is authenticated.

Controllers/services typically read the current user id from:

- `req.auth?.userId`

## Webhook endpoint

Webhooks are mounted at:

- `POST /api/webhooks/clerk`

Implementation:

- Router: `backend/src/routes/webhook.routes.ts`
- Mounted in `backend/src/server.ts` **before** JSON parsing:
  - Clerk requires raw request body for signature verification.

### Signature verification

- Library: `svix`
- Secret: `CLERK_WEBHOOK_SECRET` from env (`backend/src/config/env.config.ts`)

### Supported Clerk events

- `user.created`
  - Creates a MongoDB `User` document with:
    - `clerkId`, `username`, `email`, `displayName`, name fields, and a profile image

- `user.updated`
  - Updates the `User` record.
  - Attempts to run propagation inside a MongoDB transaction.
  - If transactions are unsupported (non-replica set), it falls back to non-transactional propagation.
  - Calls `propagateUserSnapshotUpdates(...)` to update embedded snapshots across documents.

- `user.deleted`
  - Deletes the `User` record matching the Clerk user.

### Username conflict behavior

For `user.updated`, if a username conflicts with another user:

- the update avoids overwriting the username for the current user.

## Related files

- Env schema: `backend/src/config/env.config.ts`
- User model: `backend/src/models/User.model.ts`
- Snapshot propagation: `backend/src/utils/userSnapshotPropagation.util.ts`

## Troubleshooting

- Shared troubleshooting: `docs/TROUBLESHOOTING.md`
- Shared env vars: `docs/ENVIRONMENT_VARIABLES.md`
