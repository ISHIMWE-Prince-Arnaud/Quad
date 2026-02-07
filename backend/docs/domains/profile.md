# Profile (Internal Flow)

## Entry points

- Route: `backend/src/routes/profile.routes.ts`
- Controller: `backend/src/controllers/profile.controller.ts`
- Service: `backend/src/services/profile.service.ts`
- Model: `backend/src/models/User.model.ts`
- Schema: `backend/src/schemas/profile.schema.ts`

## Data model + invariants

- Profiles are keyed by `User.clerkId` (authoritative identity).
- Many domains embed user snapshots (post author, story author, poll author, comment author, chat author).
  - `updateProfile` performs snapshot propagation via `propagateUserSnapshotUpdates`.

## Get profile by id: `GET /api/profile/id/:userId`

Service:

- Looks up `User` by `clerkId`.
- If not found, calls `ensureUserByClerkId`:
  - fetches Clerk user
  - creates a Mongo `User` record (best-effort)
- Computes profile stats via `calculateProfileStats`.
- Formats response via `formatUserProfile`.

Response contract:

- `200`:
  - `{ success: true, data: UserProfile }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 User not found` (ensure failed and user still missing).

## Get profile by username: `GET /api/profile/:username`

Service:

- Ensures current user exists in DB (if signed in).
- Looks up target user via `findUserByUsername`.
- Computes stats and returns `isOwnProfile`.

Request contract (validated by `usernameParamSchema`):

- Params:
  - `username`: non-empty string

Response contract:

- `200`:
  - `{ success: true, data: { ...UserProfile, isOwnProfile: boolean } }`

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

Request contract (validated by `updateProfileSchema`):

- Body (all optional):
  - `firstName?`, `lastName?`
  - `username?` (3-30)
  - `bio?` (max 500)
  - `profileImage?`: URL | null
  - `coverImage?`: URL | null
  - `displayName?` (legacy)

Response contract:

- `200`:
  - `{ success: true, message: "Profile updated successfully", data: UserProfile }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Forbidden: You can only update your own profile`.
- `404 User not found`.
- `409 Username already taken` (or other duplicate keys like email).
- `500 Failed to update user snapshots` (if propagation fails for non-transaction reasons).

## Profile content

- `GET /api/profile/:username/posts` -> queries Post by embedded author clerkId.
- `GET /api/profile/:username/stories` -> queries Story.
- `GET /api/profile/:username/polls` -> queries Poll.

All use `getPaginatedData`.

Request contract (validated by `paginationQuerySchema`):

- Query:
  - `page`: string -> number, default 1
  - `limit`: string -> number, default 10, must be 1-50

## Related docs

- Auth/webhooks: `backend/docs/WEBHOOKS_AND_AUTH.md`
