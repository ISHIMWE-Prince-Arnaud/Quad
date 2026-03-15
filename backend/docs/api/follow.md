# Follow API

Follow/unfollow users and retrieve follower/following lists with cursor-based pagination.

> **Rate limit:** `writeRateLimiter` applies to POST/DELETE.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Follow a User

**POST** `/api/follow/:userId`

Follow the user identified by `userId`. Cannot follow yourself.

**Params:** `userId` — Clerk or MongoDB user ID of the user to follow.

**Response (200):** `{ "success": true, "message": "User followed" }`

**Side effects:** Emits `follow:new` (Socket.IO) with `{ userId, followingId }`. Creates a notification for the followed user.

---

### Unfollow a User

**DELETE** `/api/follow/:userId`

Unfollow a user.

**Params:** `userId` — user ID of the user to unfollow.

**Response (200):** `{ "success": true, "message": "User unfollowed" }`

**Side effects:** Emits `follow:removed` (Socket.IO) with `{ userId, followingId }`.

---

### Get Followers

**GET** `/api/follow/:userId/followers`

Get a paginated list of users following `userId`.

**Params:** `userId`

**Query Parameters:**
- `limit` (optional, default: `20`)
- `cursor` (optional): Cursor for cursor-based pagination (last returned user ID).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "followers": [ /* User objects */ ],
    "nextCursor": "<userId or null>"
  }
}
```

---

### Get Following

**GET** `/api/follow/:userId/following`

Get a paginated list of users that `userId` is following.

**Params:** `userId`

**Query Parameters:** Same as Get Followers (`limit`, `cursor`).

**Response (200):** Same structure as Get Followers.

---

### Check Follow Status

**GET** `/api/follow/:userId/check`

Check whether the authenticated user is following `userId`.

**Params:** `userId`

**Response (200):**
```json
{
  "success": true,
  "data": { "isFollowing": true }
}
```

---

### Get Follow Statistics

**GET** `/api/follow/:userId/stats`

Get follower and following counts for `userId`.

**Params:** `userId`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "followersCount": 120,
    "followingCount": 85
  }
}
```

---

## Error Responses

| Status | Meaning                         |
|--------|---------------------------------|
| 400    | Validation error / self-follow  |
| 401    | No or invalid Clerk JWT         |
| 404    | Target user not found           |
| 409    | Already following (if enforced) |
