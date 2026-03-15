# Posts API

Manage text posts with optional media.

> **Rate limit:** `writeRateLimiter` applies to all write operations (POST/PUT/DELETE). `generalRateLimiter` applies to reads.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Create Post

**POST** `/api/posts`

Creates a new post for the authenticated user.

**Request Body:**
```json
{
  "text": "Post content here",
  "media": [
    {
      "url": "https://res.cloudinary.com/.../image.jpg",
      "type": "image",
      "width": 1080,
      "height": 1080,
      "publicId": "quad/posts/abc123"
    }
  ]
}
```

- `text`: **Required.** String, 1–500 characters.
- `media`: **Optional.** Array of media objects. Each item:
  - `url`: Required (string, valid URL)
  - `type`: Required (`"image"` | `"video"`)
  - `width`, `height`: Optional number
  - `publicId`: Optional string (Cloudinary public ID)

**Response (201):**
```json
{
  "success": true,
  "data": { /* Post document with populated author */ }
}
```

**Side effects:** Emits `newPost` (Socket.IO) to all connected clients.

---

### Get All Posts

**GET** `/api/posts`

Returns a paginated list of all posts.

**Query Parameters:**
- `limit` (optional, default: `20`): Number of posts to return.
- `skip` (optional, default: `0`): Number of posts to skip (offset).

**Response (200):**
```json
{
  "success": true,
  "data": { "posts": [...], "pagination": { "limit": 20, "skip": 0 } }
}
```

---

### Get Single Post

**GET** `/api/posts/:id`

Retrieve a post by its MongoDB ObjectId.

**Params:**
- `id`: MongoDB ObjectId

**Response (200):** `{ "success": true, "data": { /* Post document */ } }`

---

### Update Post

**PUT** `/api/posts/:id`

Update a post's text or media (author only).

**Params:** `id` — MongoDB ObjectId

**Request Body:** Same fields as Create (all optional in update).

**Response (200):** `{ "success": true, "data": { /* Updated post */ } }`

**Side effects:** Emits `updatePost` (Socket.IO) to all connected clients.

---

### Delete Post

**DELETE** `/api/posts/:id`

Delete a post and its associated data (author only).

**Side effects:** Emits `deletePost` and `feed:content-deleted` (Socket.IO) to all connected clients.

**Response (200):** `{ "success": true, "message": "Post deleted successfully" }`

---

## Error Responses

| Status | Meaning                              |
|--------|--------------------------------------|
| 400    | Validation error (text length, etc.) |
| 401    | No or invalid Clerk JWT              |
| 403    | Attempting to edit/delete another user's post |
| 404    | Post not found                       |

---

## Related Endpoints

- Comments on a post: `GET /api/comments/Post/:postId`
- Reactions on a post: `GET /api/reactions/Post/:postId`
- User's posts: `GET /api/profile/:username/posts`
