# Comments (Internal Flow)

## Entry points

- Route: `backend/src/routes/comment.routes.ts`
- Controller: `backend/src/controllers/comment.controller.ts`
- Service: `backend/src/services/comment.service.ts`
- Models:
  - `backend/src/models/Comment.model.ts`
  - `backend/src/models/CommentLike.model.ts`
- Schema: `backend/src/schemas/comment.schema.ts`

## Data model + invariants

Models:

- `backend/src/models/Comment.model.ts`
- `backend/src/models/CommentLike.model.ts`

Key invariants:

- Comments are only supported for `contentType: "post" | "story"`.
  - This is enforced by:
    - Zod schema enum (`commentableContentTypes`)
    - Mongoose enum on `Comment.contentType`
    - Controller explicitly rejects `poll` with `404`.
- `Comment.author` is an embedded snapshot (not a `ref`/populate relationship).
- Cached counters:
  - `Comment.reactionsCount` (updated by Reactions domain when reacting to comments)
  - `Comment.likesCount` (updated by CommentLike toggles)
- Indexes exist for:
  - `(contentType, contentId, createdAt)` (listing)
  - `(author.clerkId, createdAt)` (user history)
  - `(commentId, userId)` unique index on likes (one like per user per comment)

## Create comment: `POST /api/comments`

Controller:

- Reads `contentType`, `contentId`, `text`.
- Reads `userId`.
- Calls `CommentService.createComment(userId, { ... })`.

Request contract (validated by `createCommentSchema`):

- Body:
  - `contentType`: `post | story`
  - `contentId`: non-empty string
  - `text`: 1-2000 characters

Response contract:

- `201`:
  - `{ success: true, message: "Comment added", data: CommentDocument }`

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

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 post not found` / `404 story not found`: `verifyCommentableContent` failed.
  - For stories, draft/unpublished stories are treated as not found (comments not allowed).
- `404 User not found`: no `User` record.
- `400 Validation error`: body does not match schema.

## Get comments: `GET /api/comments/:contentType/:contentId`

Controller:

- Rejects `contentType=poll` (not supported).
- Converts `skip/limit` into `page/limit`.

Request contract (controller-derived):

- Params:
  - `contentType`: expected `post | story` (controller also checks and rejects `poll`)
  - `contentId`: required
- Query:
  - `limit?`: string -> number (default 20)
  - `skip?`: string -> number (default 0)

Response contract:

- `200`:
  - `{ success: true, data: CommentDocument[], pagination }`

Service:

- Uses `getPaginatedData(Comment, { contentType, contentId }, { sort, populate })`.

Notes:

- The service uses `populate: { path: "author", ... }`, but `author` is stored as an embedded object in the schema.
  - If this remains unchanged, populate may be a no-op; the returned `author` fields come from the embedded snapshot.

## Update comment: `PUT /api/comments/:id`

- Author-only.
- Emits legacy `commentUpdated`.

Request contract (validated by `updateCommentSchema`):

- Params:
  - `id`: non-empty string
- Body:
  - `text`: 1-2000 characters

Response contract:

- `200`:
  - `{ success: true, message: "Comment updated", data: CommentDocument }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Unauthorized`: user is not the author.
- `404 Comment not found`.

## Delete comment: `DELETE /api/comments/:id`

- Author-only.
- Decrements content comments count.
- Deletes associated likes.
- Emits legacy `commentDeleted`.
- Best-effort emits `feed:engagement-update`.

Response contract:

- `200`:
  - `{ success: true, message: "Comment deleted successfully" }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Unauthorized`: user is not the author.
- `404 Comment not found`.

## Toggle comment like: `POST /api/comments/like`

- Toggles a `CommentLike` document.
- Updates `Comment.likesCount`.
- Emits legacy like events:
  - `commentLikeAdded`
  - `commentLikeRemoved`

Request contract (validated by `toggleCommentLikeSchema`):

- Body:
  - `commentId`: non-empty string

Response contract:

- `201` (like added):
  - `{ success: true, message: "Like added", liked: true, likesCount, data: CommentLikeDocument }`
- `200` (like removed):
  - `{ success: true, message: "Like removed", liked: false, likesCount }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 Comment not found`.
- `404 User not found`.

## Get comment likes: `GET /api/comments/:id/likes`

- Returns the list of `CommentLike` rows for a given comment.
- Response:
  - `{ success: true, data: CommentLikeDocument[], count: number }`

## Related docs

- Notifications: `backend/docs/domains/notifications.md`
- Realtime spec: `backend/docs/REALTIME_SPEC.md`
