# Feed API

The feed returns a mixed content timeline of Posts and Polls. Two modes are available.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### For You Feed

**GET** `/api/feed`  
**GET** `/api/feed/foryou`

Returns a personalized "For You" feed — a mix of content from followed users and discovery content, ordered by recency and engagement.

**Query Parameters:**
- `limit` (optional, default: `20`)
- `cursor` (optional): Cursor for cursor-based pagination.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "contentType": "Post",
        "content": { /* Post or Poll document */ }
      }
    ],
    "nextCursor": "<cursorValue or null>"
  }
}
```

> Note: `GET /api/feed` and `GET /api/feed/foryou` map to the same controller (`getForYouFeed`).

---

### Following Feed

**GET** `/api/feed/following`

Returns content exclusively from users the authenticated user follows.

**Query Parameters:** Same as For You Feed.

**Response (200):** Same structure as For You Feed.

---

## Real-time Feed Updates

The feed is kept live via Socket.IO events. The client joins a `feed:{userId}` room on connection.

| Event                  | When triggered                          |
|------------------------|-----------------------------------------|
| `newPost`              | A new post is created                   |
| `updatePost`           | A post is updated                       |
| `deletePost`           | A post is deleted                       |
| `newPoll`              | A new poll is created                   |
| `pollUpdated`          | A poll is updated                       |
| `pollDeleted`          | A poll is deleted                       |
| `feed:engagement-update` | Reactions, comments, or votes change  |
| `feed:content-deleted` | Post or poll deleted (feed UI removal)  |

> **Note:** Feed rooms are joined but most events are currently emitted globally (`io.emit(...)`), not room-scoped. See [Realtime Spec](../REALTIME_SPEC.md) for details.

---

## Error Responses

| Status | Meaning                    |
|--------|----------------------------|
| 400    | Validation error           |
| 401    | No or invalid Clerk JWT    |
