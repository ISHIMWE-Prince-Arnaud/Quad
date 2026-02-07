# Bookmarks (Internal Flow)

## Entry points

- Route: `backend/src/routes/bookmark.routes.ts`
- Controller: `backend/src/controllers/bookmark.controller.ts`
- Model: `backend/src/models/Bookmark.model.ts`
- Schema: `backend/src/schemas/bookmark.schema.ts`

## Data model + invariants

Model: `backend/src/models/Bookmark.model.ts`

- Unique tuple `(userId, contentType, contentId)`.
- `contentType` is restricted to `post | story | poll`.
- Bookmarks are purely user-specific state and currently do not emit realtime events.

## Notes on architecture

Bookmarks are implemented directly in the controller using the `Bookmark` model.
There is currently no dedicated service layer for bookmarks.

## Toggle bookmark: `POST /api/bookmarks`

Controller behavior:

- Reads `{ contentType, contentId }`.
- Checks if a bookmark exists for `(userId, contentType, contentId)`.
- If exists:
  - deletes it
  - returns `{ bookmarked: false }`
- Else:
  - creates it
  - returns `{ bookmarked: true }`

Request contract (validated by `createBookmarkSchema`):

- Body:
  - `contentType`: `post | story | poll`
  - `contentId`: non-empty string

Response contract:

- `201` (created):
  - `{ success: true, data: BookmarkDocument, bookmarked: true }`
- `200` (removed):
  - `{ success: true, data: null, bookmarked: false }`

## List bookmarks: `GET /api/bookmarks`

- Parses query via `getBookmarksQuerySchema`.
- Supports filter by `contentType`.
- Returns pagination metadata.

Request contract (validated by `getBookmarksQuerySchema`):

- Query:
  - `page`: string -> number, default 1
  - `limit`: string -> number, default 20, must be 1-50
  - `contentType?`: `post | story | poll`

## Check bookmark: `GET /api/bookmarks/:contentType/:contentId/check`

- Returns `{ bookmarked: boolean }`.

Request contract (validated by `bookmarkParamsSchema`):

- Params:
  - `contentType`: `post | story | poll`
  - `contentId`: non-empty string

## Remove bookmark: `DELETE /api/bookmarks/:contentType/:contentId`

- Deletes bookmark for the tuple.

Response contract:

- `200`:
  - `{ success: true, message: "Bookmark removed" }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `400 Validation error`: invalid params/body.
- `500 Server error`: controller catches and logs errors.

## Related docs

- API reference: `backend/docs/api/README.md`
