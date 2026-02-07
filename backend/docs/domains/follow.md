# Follow (Internal Flow)

## Entry points

- Route: `backend/src/routes/follow.routes.ts`
- Controller: `backend/src/controllers/follow.controller.ts`
- Service: `backend/src/services/follow.service.ts`
- Model: `backend/src/models/Follow.model.ts`
- Schema: `backend/src/schemas/follow.schema.ts`

## Data model + invariants

Model: `backend/src/models/Follow.model.ts`

- `userId`: follower Clerk id
- `followingId`: followed Clerk id
- Unique constraint: `(userId, followingId)`
- Self-follow is prevented:
  - Mongoose `pre("save")` hook throws if `userId === followingId`.

## Follow: `POST /api/follow/:userId`

- Controller reads `currentUserId`.
- Calls `FollowService.followUser(currentUserId, targetUserId)`.

Request contract (validated by `userIdParamSchema`):

- Params:
  - `userId`: non-empty string

Response contract:

- `201`:
  - `{ success: true, message: "Successfully followed user" }`

Service behavior:

- Prevents self-follow.
- Ensures target user exists.
- Prevents duplicates via `isFollowing(...)`.
- Creates `Follow` document.
- Updates follower/following counts via `updateFollowCounts(...)`.

Side effects:

- Creates a `follow` notification for the target user.
- Emits realtime:
  - `follow:new` with `{ userId, followingId }` (global emit).

Failure modes:

- `401 Unauthorized`: missing auth.
- `400`/`409` duplicates / self-follow depending on where rejected (service vs model).
- `404 User not found` (target not found).

## Unfollow: `DELETE /api/follow/:userId`

- Deletes follow relationship.
- Updates counts.

Side effects:

- Emits `follow:removed`.

Response contract:

- `200`:
  - `{ success: true, message: "Successfully unfollowed user" }`

## Lists

### Followers: `GET /api/follow/:userId/followers`

- Uses pagination helper `getPaginatedData` on Follow collection.
- Bulk loads follower `User` docs.
- Enriches with `isFollowing` status relative to current user.

Request contract (validated by `getFollowListQuerySchema`):

- Query:
  - `page`: string -> number, default 1, must be > 0
  - `limit`: string -> number, default 20, must be 1-100

Response contract:

- `200`:
  - `{ success: true, data, pagination }`

### Following: `GET /api/follow/:userId/following`

- Similar flow but based on `Follow.userId = targetUserId`.

## Status / stats

- `GET /api/follow/:userId/check` uses `isFollowing` helper.
- `GET /api/follow/:userId/stats` delegates to `computeFollowStats`.

Failure modes (lists/status/stats):

- `401 Unauthorized`: missing auth.
- `404 User not found` (target not found).

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
