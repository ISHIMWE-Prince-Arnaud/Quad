# Follow (Internal Flow)

## Entry points

- Route: `backend/src/routes/follow.routes.ts`
- Controller: `backend/src/controllers/follow.controller.ts`
- Service: `backend/src/services/follow.service.ts`
- Model: `backend/src/models/Follow.model.ts`
- Schema: `backend/src/schemas/follow.schema.ts`

## Follow: `POST /api/follow/:userId`

- Controller reads `currentUserId`.
- Calls `FollowService.followUser(currentUserId, targetUserId)`.

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

## Unfollow: `DELETE /api/follow/:userId`

- Deletes follow relationship.
- Updates counts.

Side effects:

- Emits `follow:removed`.

## Lists

### Followers: `GET /api/follow/:userId/followers`

- Uses pagination helper `getPaginatedData` on Follow collection.
- Bulk loads follower `User` docs.
- Enriches with `isFollowing` status relative to current user.

### Following: `GET /api/follow/:userId/following`

- Similar flow but based on `Follow.userId = targetUserId`.

## Status / stats

- `GET /api/follow/:userId/check` uses `isFollowing` helper.
- `GET /api/follow/:userId/stats` delegates to `computeFollowStats`.

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
