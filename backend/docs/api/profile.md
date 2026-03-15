# Profile API

Public profile data and user content listings. Use this domain for displaying user profiles, timelines, and profile updates.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Get Profile by Username

**GET** `/api/profile/:username`

Retrieve a user's public profile by their username.

**Params:** `username` — string username (validated by `usernameParamSchema`).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "<MongoId>",
    "clerkId": "user_2abc...",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Student, developer",
    "profileImageUrl": "https://res.cloudinary.com/...",
    "coverImageUrl": "https://res.cloudinary.com/...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Get Profile by ID

**GET** `/api/profile/id/:userId`

Convenience endpoint: look up a profile by Clerk user ID (not MongoDB ObjectId).

**Params:** `userId` — Clerk user ID.

**Response (200):** Same shape as Get Profile by Username.

---

### Update Profile

**PUT** `/api/profile/:username`

Update the authenticated user's own profile. You cannot update another user's profile.

**Params:** `username` — must match the authenticated user's username.

**Request Body (all optional):**
```json
{
  "bio": "Updated bio",
  "profileImageUrl": "https://res.cloudinary.com/.../profile.jpg",
  "coverImageUrl": "https://res.cloudinary.com/.../cover.jpg",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

**Response (200):** `{ "success": true, "data": { /* Updated user */ } }`

---

### Get User's Posts

**GET** `/api/profile/:username/posts`

Get paginated posts created by a user.

**Params:** `username`

**Query Parameters:**
- `limit` (optional, default: `20`)
- `cursor` (optional): Cursor-based pagination.

**Response (200):** `{ "success": true, "data": { "posts": [...], "nextCursor": "..." } }`

---

### Get User's Stories

**GET** `/api/profile/:username/stories`

Get paginated *published* stories by a user (drafts not included).

**Params:** `username`

**Query Parameters:** Same as Get User's Posts.

**Response (200):** `{ "success": true, "data": { "stories": [...], "nextCursor": "..." } }`

---

### Get User's Polls

**GET** `/api/profile/:username/polls`

Get paginated polls created by a user.

**Params:** `username`

**Query Parameters:** Same as Get User's Posts.

**Response (200):** `{ "success": true, "data": { "polls": [...], "nextCursor": "..." } }`

---

## Error Responses

| Status | Meaning                              |
|--------|--------------------------------------|
| 400    | Validation error                     |
| 401    | No or invalid Clerk JWT              |
| 403    | Updating another user's profile      |
| 404    | User not found                       |
