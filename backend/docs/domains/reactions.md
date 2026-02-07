# Reactions (Internal Flow)

## Entry points

- Route: `backend/src/routes/reaction.routes.ts`
- Controller: `backend/src/controllers/reaction.controller.ts`
- Service: `backend/src/services/reaction.service.ts`
- Model: `backend/src/models/Reaction.model.ts`
- Schema: `backend/src/schemas/reaction.schema.ts`

## Data model + invariants

Model: `backend/src/models/Reaction.model.ts`

- Content scope:
  - `contentType`: `post | story | poll | comment`
  - `contentId`: string
- Actor scope:
  - `userId` is a Clerk id
  - `username` and `profileImage?` are stored on the reaction row (snapshot-at-time-of-reaction)
- Reaction types:
  - Currently only `"love"` (`reactionTypes = ["love"]`).
- Uniqueness:
  - Unique compound index `(contentType, contentId, userId)` ensures one reaction per user per content.

Cached counters updated by this domain:

- `reactionsCount` is cached on reactable content via `content.util.ts`:
  - Posts: `Post.reactionsCount`
  - Stories: `Story.reactionsCount`
  - Polls: `Poll.reactionsCount`
  - Comments: `Comment.reactionsCount`

## Toggle reaction: `POST /api/reactions`

Controller:

- Reads `{ contentType, contentId, type }`.
- Calls `ReactionService.toggleReaction(userId, { ... })`.

Request contract (validated by `createReactionSchema`):

- Body:
  - `contentType`: `post | story | poll | comment`
  - `contentId`: non-empty string
  - `type`: `love`

Response contract (controller returns `ReactionService` result):

- `201` (new reaction):
  - `{ success: true, message: "Reaction added", data: ReactionDocument, reactionCount }`
- `200` (reaction removed):
  - `{ success: true, message: "Reaction removed", data: null, reactionCount }`
- `200` (reaction updated):
  - `{ success: true, message: "Reaction updated", data: ReactionDocument }`

Service:

- Verifies content exists via `verifyReactableContent`.
- Notes on `verifyReactableContent`:
  - Story reactions are only allowed for `status=published` (draft stories are treated as not found).
- Loads reacting user `User`.
- Determines content owner id.

Cases:

- Existing reaction same type:
  - delete reaction
  - decrement content reaction count
  - recompute authoritative `reactionCount`
  - emit legacy `reactionRemoved`
  - emit `feed:engagement-update` for post/poll

- Existing reaction different type:
  - update reaction
  - emit legacy `reactionUpdated`

- New reaction:
  - create reaction
  - increment content reaction count
  - recompute authoritative `reactionCount`
  - create notification for content owner
  - emit legacy `reactionAdded`
  - emit `feed:engagement-update` for post/poll

Notification side effects:

- For new reactions, if the content owner differs from actor:
  - `type` is one of:
    - `reaction_post`
    - `reaction_story`
    - `reaction_poll`
  - `createNotification(...)` emits:
    - `notification:new`
    - `notification:unread_count` (authoritative count)

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 {contentType} not found`: invalid contentId or disallowed content (e.g. draft story).
- `404 User not found`: no `User` row for the Clerk id.
- `400 Validation error`: invalid `contentType` or `type`.

## Get reactions by content: `GET /api/reactions/:contentType/:contentId`

- Returns:
  - all reaction docs
  - aggregated counts
  - current user’s reaction (if signed in)

Request contract (validated by `getReactionsByContentSchema`):

- Params:
  - `contentType`: `post | story | poll | comment`
  - `contentId`: non-empty string

Response contract:

- `200`:
  - `{ success: true, data: { reactions, reactionCounts, userReaction, totalCount } }`

## Get my reactions: `GET /api/reactions/me`

- Simple paginated list of current user reactions.

Request contract (controller-derived):

- Query:
  - `limit?`: string (default 20)
  - `skip?`: string (default 0)

Response contract:

- `200`:
  - `{ success: true, data: ReactionDocument[], pagination }`

## Delete reaction: `DELETE /api/reactions/:contentType/:contentId`

- Alternative to toggle.
- Returns authoritative `reactionCount`.

Response contract:

- `200`:
  - `{ success: true, message: "Reaction removed", reactionCount }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 Reaction not found`.

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
