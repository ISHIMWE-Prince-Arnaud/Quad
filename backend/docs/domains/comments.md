# Comments (Internal Flow)

## Entry points

- Route: `backend/src/routes/comment.routes.ts`
- Controller: `backend/src/controllers/comment.controller.ts`
- Service: `backend/src/services/comment.service.ts`
- Models:
  - `backend/src/models/Comment.model.ts`
  - `backend/src/models/CommentLike.model.ts`
- Schema: `backend/src/schemas/comment.schema.ts`

## Create comment: `POST /api/comments`

Controller:

- Reads `contentType`, `contentId`, `text`.
- Reads `userId`.
- Calls `CommentService.createComment(userId, { ... })`.

Service:

- Verifies content exists via `verifyCommentableContent`.
- Loads author `User`.
- Creates `Comment` with embedded author snapshot.
- Extracts mentions and creates mention notifications (`mention_comment`).
- Increments comment count for target content via `updateContentCommentsCount`.
- If content owner differs from actor, creates `comment_post` or `comment_story` notification.

Realtime side effects:

- Emits legacy `commentAdded`.
- Best-effort emits `feed:engagement-update` for post comments.

## Get comments: `GET /api/comments/:contentType/:contentId`

Controller:

- Rejects `contentType=poll` (not supported).
- Converts `skip/limit` into `page/limit`.

Service:

- Uses `getPaginatedData(Comment, { contentType, contentId }, { sort, populate })`.

## Update comment: `PUT /api/comments/:id`

- Author-only.
- Emits legacy `commentUpdated`.

## Delete comment: `DELETE /api/comments/:id`

- Author-only.
- Decrements content comments count.
- Deletes associated likes.
- Emits legacy `commentDeleted`.
- Best-effort emits `feed:engagement-update`.

## Toggle comment like: `POST /api/comments/like`

- Toggles a `CommentLike` document.
- Updates `Comment.likesCount`.
- Emits legacy like events:
  - `commentLikeAdded`
  - `commentLikeRemoved`

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
