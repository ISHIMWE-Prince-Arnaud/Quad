# Chat API

REST endpoints for the global chat timeline. Real-time updates are handled via Socket.IO (see [Realtime Spec](../REALTIME_SPEC.md)).

> **Note:** Quad's chat is a **single global timeline** — there are no private DM conversations. `otherUserId` in `GET /messages` is used for message history retrieval.

> **Rate limit:** `writeRateLimiter` applies to POST/PUT/DELETE. `generalRateLimiter` applies to GET.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Send Message

**POST** `/api/chat/messages`

Sends a message.

**Request Body:**
```json
{
  "content": "Hello everyone!",
  "receiverId": "<userId>"
}
```

- `content`: **Required.** String, 1–2000 characters.
- `receiverId`: **Required.** Target user's ID string.

**Response (201):**
```json
{
  "success": true,
  "data": { /* Formatted message from formatMessageResponse() */ }
}
```

**Side effects:** Emits `chat:message:new` (Socket.IO) globally.

---

### Get Messages

**GET** `/api/chat/messages`

Retrieve paginated message history.

**Query Parameters:**
- `otherUserId`: **Required.** User ID to retrieve conversation history with.
- `limit` (optional, default: `20`): Number of messages to return.
- `cursor` (optional): Cursor for cursor-based pagination (message ID).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [ /* Array of formatted messages */ ],
    "nextCursor": "<messageId or null>"
  }
}
```

---

### Edit Message

**PUT** `/api/chat/messages/:id`

Edit a message you sent (sender only).

**Params:** `id` — MongoDB ObjectId of the message.

**Request Body:**
```json
{
  "content": "Updated content"
}
```

- `content`: **Required** string.

**Side effects:** Emits `chat:message:edited` (Socket.IO) globally.

**Response (200):** `{ "success": true, "data": { /* Updated message */ } }`

---

### Delete Message

**DELETE** `/api/chat/messages/:id`

Delete a message you sent (sender only).

**Params:** `id` — MongoDB ObjectId.

**Side effects:** Emits `chat:message:deleted` with `{ id }` (Socket.IO) globally.

**Response (200):** `{ "success": true, "message": "Message deleted" }`

---

## Socket.IO Events (Chat)

| Event                | Direction        | Payload                        |
|----------------------|------------------|--------------------------------|
| `chat:message:new`   | Server → Client  | Formatted message object       |
| `chat:message:edited`| Server → Client  | Formatted message object       |
| `chat:message:deleted`| Server → Client | `{ id: string }`               |
| `chat:typing:start`  | Client → Server → Broadcast | `{ userId, username }` |
| `chat:typing:stop`   | Client → Server → Broadcast | `{ userId }`           |

> See [Realtime Spec](../REALTIME_SPEC.md) for full Socket.IO documentation.

---

## Error Responses

| Status | Meaning                                   |
|--------|-------------------------------------------|
| 400    | Validation error (empty content, etc.)    |
| 401    | No or invalid Clerk JWT                   |
| 403    | Editing/deleting a message you don't own  |
| 404    | Message not found                         |
