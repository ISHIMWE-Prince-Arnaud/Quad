# Bookmarks API Documentation

Save/unsave and list bookmarked content.

## 4dd Endpoints

### Create bookmark
**POST** `/api/bookmarks`

### List bookmarks
**GET** `/api/bookmarks`

Query params validated by `getBookmarksQuerySchema`.

### Check bookmark
**GET** `/api/bookmarks/:contentType/:contentId/check`

### Remove bookmark
**DELETE** `/api/bookmarks/:contentType/:contentId`

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/bookmark.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/body/query
- **401** missing/invalid auth
- **404** bookmark not found
