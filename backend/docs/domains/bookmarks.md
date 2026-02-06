# Bookmarks (Internal Flow)

## Entry points

- Route: `backend/src/routes/bookmark.routes.ts`
- Controller: `backend/src/controllers/bookmark.controller.ts`
- Model: `backend/src/models/Bookmark.model.ts`
- Schema: `backend/src/schemas/bookmark.schema.ts`

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

## List bookmarks: `GET /api/bookmarks`

- Parses query via `getBookmarksQuerySchema`.
- Supports filter by `contentType`.
- Returns pagination metadata.

## Check bookmark: `GET /api/bookmarks/:contentType/:contentId/check`

- Returns `{ bookmarked: boolean }`.

## Remove bookmark: `DELETE /api/bookmarks/:contentType/:contentId`

- Deletes bookmark for the tuple.

## Related docs

- API reference: `backend/docs/api/README.md`
