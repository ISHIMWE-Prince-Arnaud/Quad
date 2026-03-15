# Notifications API

Retrieve, read, and delete notifications for the authenticated user.

> All notification state changes also emit real-time Socket.IO events. See [Realtime Spec](../REALTIME_SPEC.md).

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Get Notifications

**GET** `/api/notifications`

Returns paginated notifications for the authenticated user (newest first).

**Query Parameters:**
- `limit` (optional, default: `20`)
- `cursor` (optional): MongoDB ObjectId of the last notification — for cursor-based pagination.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "<MongoId>",
        "userId": "<userId>",
        "type": "follow",
        "message": "johndoe started following you",
        "isRead": false,
        "actor": { "id": "...", "username": "johndoe", "profileImageUrl": "..." },
        "contentId": "<MongoId>",
        "contentType": "Post",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "nextCursor": "<MongoId or null>"
  }
}
```

**Notification types** (from `Notification.model.ts`):
`follow`, `reaction`, `comment`, `mention`, `poll_vote`, `poll_expired`

---

### Get Unread Count

**GET** `/api/notifications/unread-count`

Returns total count of unread notifications.

**Response (200):**
```json
{
  "success": true,
  "data": { "unreadCount": 5 }
}
```

---

### Mark All as Read

**PATCH** `/api/notifications/read-all`

Marks all unread notifications as read.

**Side effects:** Emits `notification:read_all` and `notification:unread_count` (Socket.IO) to the user's room.

**Response (200):** `{ "success": true, "message": "All notifications marked as read" }`

---

### Delete All Read Notifications

**DELETE** `/api/notifications/read`

Removes all notifications that have been marked as read.

**Side effects:** Emits `notification:clear_read` and `notification:unread_count` (Socket.IO) to the user's room.

**Response (200):** `{ "success": true, "message": "Read notifications cleared" }`

---

### Mark Single Notification as Read

**PATCH** `/api/notifications/:id/read`

Mark a specific notification as read by ID.

**Params:** `id` — MongoDB ObjectId

**Side effects:** Emits `notification:read` with `{ id }` and updated `notification:unread_count` (Socket.IO).

**Response (200):** `{ "success": true, "data": { /* Updated notification */ } }`

---

### Delete Notification

**DELETE** `/api/notifications/:id`

Delete a specific notification by ID.

**Params:** `id` — MongoDB ObjectId

**Side effects:** Emits `notification:deleted` with `{ id }` and updated `notification:unread_count` (Socket.IO).

**Response (200):** `{ "success": true, "message": "Notification deleted" }`

---

## Error Responses

| Status | Meaning                              |
|--------|--------------------------------------|
| 400    | Validation error                     |
| 401    | No or invalid Clerk JWT              |
| 404    | Notification not found               |
