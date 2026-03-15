# Reactions API

Toggle reactions on Posts, Stories, and Polls. Currently only the `love` (❤️) reaction type is supported.

> **Rate limit:** `writeRateLimiter` applies to POST/DELETE.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Toggle Reaction

**POST** `/api/reactions`

Toggle a reaction on a content item. Behavior:
- If the user has **no reaction**: creates one → emits `reactionAdded`.
- If the user has the **same reaction type**: removes it → emits `reactionRemoved`.
- If the user has a **different reaction type**: updates it → emits `reactionUpdated`.

**Request Body:**
```json
{
  "contentType": "Post",
  "contentId": "<MongoDB ObjectId>",
  "type": "love"
}
```

- `contentType`: **Required.** `"Post"` | `"Story"` | `"Poll"`
- `contentId`: **Required.** MongoDB ObjectId.
- `type`: **Required.** Currently only `"love"` is supported.

**Side effects:** Emits one of: `reactionAdded`, `reactionUpdated`, `reactionRemoved` (Socket.IO) globally. Also emits `feed:engagement-update`.

**Response (200):** `{ "success": true, "data": { "action": "added" | "removed" | "updated", "reactionCount": 5 } }`

---

### Get My Reactions

**GET** `/api/reactions/me`

Get all reactions the authenticated user has made.

**Response (200):** `{ "success": true, "data": { "reactions": [ /* Reaction documents */ ] } }`

---

### Get Reactions for Content

**GET** `/api/reactions/:contentType/:contentId`

Get aggregated reaction counts and type breakdown for a content item.

**Params:**
- `contentType`: `"Post"` | `"Story"` | `"Poll"`
- `contentId`: MongoDB ObjectId

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 15,
    "breakdown": { "love": 15 },
    "userReaction": { "type": "love" }
  }
}
```

---

### Delete Reaction

**DELETE** `/api/reactions/:contentType/:contentId`

Explicitly delete the authenticated user's reaction from a content item.

**Params:**
- `contentType`: `"Post"` | `"Story"` | `"Poll"`
- `contentId`: MongoDB ObjectId

**Side effects:** Emits `reactionRemoved` and `feed:engagement-update` (Socket.IO).

**Response (200):** `{ "success": true, "message": "Reaction removed" }`

---

## Error Responses

| Status | Meaning                                |
|--------|----------------------------------------|
| 400    | Invalid contentType or unknown type    |
| 401    | No or invalid Clerk JWT                |
| 404    | Content item not found (if enforced)   |
