# Users API

CRUD for application users, mapped to Clerk identities. User creation is typically triggered after a successful Clerk signup session (or via webhooks).

> **Rate limit:** `authRateLimiter` is applied to `POST /users`. `generalRateLimiter` applies to all other routes.

## Endpoints

---

### Create User

**POST** `/api/users`

Creates an application `User` document for the authenticated Clerk session. Typically called once after a fresh sign-up.

**Auth:** Required (`requireApiAuth` + `authRateLimiter`).

**Request Body:**
```json
{
  "clerkId": "user_2abc...",
  "email": "user@example.com",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe"
}
```

- All fields are **required**.
- `username`: Must be unique across the platform.
- `email`: Must be unique across the platform.

**Response (201):**
```json
{
  "success": true,
  "data": { /* User document */ }
}
```

**Errors:**
- `409` — Username or email already exists.

---

### Check Username Availability

**GET** `/api/users/check/:username`

Check if a username is available (no auth required).

**Params:** `username` — string to check.

**Response (200):**
```json
{
  "success": true,
  "data": { "available": true }
}
```

---

### Check Email Availability

**GET** `/api/users/check-email/:email`

Check if an email is available (no auth required).

**Params:** `email` — email address to check.

**Response (200):**
```json
{
  "success": true,
  "data": { "available": true }
}
```

---

### Get User by Clerk ID

**GET** `/api/users/:clerkId`

Retrieve a user document by their Clerk ID.

**Auth:** Required.

**Params:** `clerkId` — the Clerk user ID (e.g., `user_2abc...`).

**Response (200):**
```json
{
  "success": true,
  "data": { /* User document */ }
}
```

---

### Update User

**PUT** `/api/users/:clerkId`

Update user profile fields (authenticated user only).

**Auth:** Required.

**Params:** `clerkId` — target user's Clerk ID.

**Request Body (all optional):**
```json
{
  "username": "newname",
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "New bio",
  "profileImageUrl": "https://res.cloudinary.com/..."
}
```

**Response (200):** `{ "success": true, "data": { /* Updated user */ } }`

---

### Delete User

**DELETE** `/api/users/:clerkId`

Delete a user account (authenticated user only).

**Auth:** Required.

**Params:** `clerkId` — target user's Clerk ID.

**Response (200):** `{ "success": true, "message": "User deleted" }`

---

## Error Responses

| Status | Meaning                                      |
|--------|----------------------------------------------|
| 400    | Validation error                             |
| 401    | No or invalid Clerk JWT                      |
| 403    | Attempting to modify another user's account  |
| 404    | User not found                               |
| 409    | Username or email already exists             |

---

## Notes

- `clerkId` is the Clerk user ID (`user_xxx...`) — not a MongoDB ObjectId.
- For public profile data (bio, avatar, follow counts), use [`/api/profile/:username`](./profile.md) instead.
- Username/email check endpoints do **not** require authentication and are safe to call during the registration flow.
