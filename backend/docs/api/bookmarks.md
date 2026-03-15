# Bookmarks API

Save and retrieve bookmarked content (Posts, Stories, Polls).

> **Rate limit:** `writeRateLimiter` applies to POST/DELETE.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Create Bookmark

**POST** `/api/bookmarks`

Save a content item to the user's bookmarks.

**Request Body:**
```json
{
  "contentType": "Post",
  "contentId": "<MongoDB ObjectId>"
}
```

- `contentType`: **Required.** `"Post"` | `"Story"` | `"Poll"`
- `contentId`: **Required.** MongoDB ObjectId of the item.

**Response (201):** `{ "success": true, "data": { /* Bookmark document */ } }`

---

### Get Bookmarks

**GET** `/api/bookmarks`

Get the authenticated user's bookmarked content with cursor-based pagination.

**Query Parameters:**
- `limit` (optional, default: `20`)
- `cursor` (optional): Last returned bookmark ID for cursor-based pagination.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookmarks": [
      {
        "_id": "<bookmarkId>",
        "contentType": "Post",
        "contentId": { /* Populated content object */ },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "nextCursor": "<bookmarkId or null>"
  }
}
```

---

### Check Bookmark Status

**GET** `/api/bookmarks/:contentType/:contentId/check`

Check whether the authenticated user has bookmarked a specific content item.

**Params:**
- `contentType`: `"Post"` | `"Story"` | `"Poll"`
- `contentId`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": { "isBookmarked": true }
}
```

---

### Remove Bookmark

**DELETE** `/api/bookmarks/:contentType/:contentId`

Remove a bookmark.

**Params:**
- `contentType`: `"Post"` | `"Story"` | `"Poll"`
- `contentId`: MongoDB ObjectId

**Response (200):** `{ "success": true, "message": "Bookmark removed" }`

---

## Error Responses

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Validation error               |
| 401    | No or invalid Clerk JWT        |
| 404    | Bookmark not found             |
