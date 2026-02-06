# Profile (Internal Flow)

## Entry points

- Route: `backend/src/routes/profile.routes.ts`
- Controller: `backend/src/controllers/profile.controller.ts`
- Service: `backend/src/services/profile.service.ts`
- Model: `backend/src/models/User.model.ts`
- Schema: `backend/src/schemas/profile.schema.ts`

## Get profile by id: `GET /api/profile/id/:userId`

Service:

- Looks up `User` by `clerkId`.
- If not found, calls `ensureUserByClerkId`:
  - fetches Clerk user
  - creates a Mongo `User` record (best-effort)
- Computes profile stats via `calculateProfileStats`.
- Formats response via `formatUserProfile`.

## Get profile by username: `GET /api/profile/:username`

Service:

- Ensures current user exists in DB (if signed in).
- Looks up target user via `findUserByUsername`.
- Computes stats and returns `isOwnProfile`.

## Update profile: `PUT /api/profile/:username`

Key invariants:

- Only the owner can update.
- Username uniqueness is enforced.

Service:

- Uses a Mongo session/transaction to:
  - update the `User`
  - propagate snapshots via `propagateUserSnapshotUpdates`
- If transactions unsupported, falls back to non-transaction propagation.
- Attempts to sync changes back to Clerk via `clerkClient.users.updateUser`.

## Profile content

- `GET /api/profile/:username/posts` -> queries Post by embedded author clerkId.
- `GET /api/profile/:username/stories` -> queries Story.
- `GET /api/profile/:username/polls` -> queries Poll.

All use `getPaginatedData`.

## Related docs

- Auth/webhooks: `backend/docs/WEBHOOKS_AND_AUTH.md`
