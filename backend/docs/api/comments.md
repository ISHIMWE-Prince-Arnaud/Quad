# Comments API

Comments on Posts, Stories, and Polls — with threading (parent comments), plus comment-level likes.

> **Rate limit:** `writeRateLimiter` applies to all write operations.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Create Comment

**POST** `/api/comments`

**Request Body:**
```json
{
  "contentType": "Post",
  "contentId": "<MongoDB ObjectId>",
  "text": "My comment here",
  "parentCommentId": "<commentId (optional, for replies)>"
}
```

- `contentType`: **Required.** `"Post"` | `"Story"` | `"Poll"`
- `contentId`: **Required.** MongoDB ObjectId of the target content.
- `text`: **Required.** String (non-empty).
- `parentCommentId`: Optional. MongoDB ObjectId — creates a reply.

**Response (201):** `{ "success": true, "data": { /* Comment document */ } }`

**Side effects:**
- Emits `commentAdded` (Socket.IO) with `{ contentType, contentId, comment }` globally.
- Emits `feed:engagement-update` for posts.
- Creates a notification for the content author.

---

### Get Comments for Content

**GET** `/api/comments/:contentType/:contentId`

Retrieve all top-level comments for a content item.

**Params:**
- `contentType`: `"Post"` | `"Story"` | `"Poll"`
- `contentId`: MongoDB ObjectId

**Query Parameters:**
- `limit` (optional, default: `20`)
- `skip` (optional, default: `0`)

**Response (200):** `{ "success": true, "data": { "comments": [...] } }`

---

### Get Single Comment

**GET** `/api/comments/:id`

Get a specific comment by its ID.

**Params:** `id` — MongoDB ObjectId

**Response (200):** `{ "success": true, "data": { /* Comment document */ } }`

---

### Update Comment

**PUT** `/api/comments/:id`

Update a comment's text (author only).

**Request Body:**
```json
{ "text": "Updated comment text" }
```

**Side effects:** Emits `commentUpdated` (Socket.IO) globally.

**Response (200):** `{ "success": true, "data": { /* Updated comment */ } }`

---

### Delete Comment

**DELETE** `/api/comments/:id`

Delete a comment (author only). Cascades — also deletes all replies and comment likes.

**Side effects:** Emits `commentDeleted` (Socket.IO). Emits `feed:engagement-update` for posts.

**Response (200):** `{ "success": true, "message": "Comment deleted" }`

---

### Toggle Comment Like

**POST** `/api/comments/like`

Like or unlike a comment (toggles).

**Request Body:**
```json
{ "commentId": "<MongoDB ObjectId>" }
```

**Side effects:** Emits `commentLikeAdded` or `commentLikeRemoved` (Socket.IO) with `{ commentId, userId, likesCount }`.

**Response (200):** `{ "success": true, "data": { "liked": true, "likesCount": 5 } }`

---

### Get Comment Likes

**GET** `/api/comments/:id/likes`

Get a list of users who liked a comment.

**Params:** `id` — MongoDB ObjectId

**Response (200):** `{ "success": true, "data": { "likes": [ /* User objects */ ] } }`

---

## Error Responses

| Status | Meaning                                 |
|--------|-----------------------------------------|
| 400    | Validation error                        |
| 401    | No or invalid Clerk JWT                 |
| 403    | Editing/deleting another user's comment |
| 404    | Comment or content not found            |
