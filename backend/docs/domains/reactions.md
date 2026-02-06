# Reactions (Internal Flow)

## Entry points

- Route: `backend/src/routes/reaction.routes.ts`
- Controller: `backend/src/controllers/reaction.controller.ts`
- Service: `backend/src/services/reaction.service.ts`
- Model: `backend/src/models/Reaction.model.ts`
- Schema: `backend/src/schemas/reaction.schema.ts`

## Toggle reaction: `POST /api/reactions`

Controller:

- Reads `{ contentType, contentId, type }`.
- Calls `ReactionService.toggleReaction(userId, { ... })`.

Service:

- Verifies content exists via `verifyReactableContent`.
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

## Get reactions by content: `GET /api/reactions/:contentType/:contentId`

- Returns:
  - all reaction docs
  - aggregated counts
  - current user’s reaction (if signed in)

## Get my reactions: `GET /api/reactions/me`

- Simple paginated list of current user reactions.

## Delete reaction: `DELETE /api/reactions/:contentType/:contentId`

- Alternative to toggle.
- Returns authoritative `reactionCount`.

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
