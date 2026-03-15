# Polls API

Interactive polls with multiple-choice voting, media support, and automatic expiration.

> **Rate limit:** `writeRateLimiter` applies to POST/PUT/DELETE.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Create Poll

**POST** `/api/polls`

Create a new poll with 2–5 options.

**Request Body:**
```json
{
  "question": "What's your favorite programming language?",
  "questionMedia": {
    "url": "https://res.cloudinary.com/.../img.jpg",
    "type": "image"
  },
  "options": [
    {
      "text": "JavaScript",
      "media": { "url": "https://...", "type": "image" }
    },
    { "text": "Python" },
    { "text": "TypeScript" }
  ],
  "settings": {
    "allowMultiple": false,
    "showResults": "after_vote"
  },
  "expiresAt": "2024-12-15T23:59:59Z"
}
```

- `question`: **Required.** 10–280 characters.
- `options`: **Required.** Array of 2–5 items. Each has:
  - `text`: Required, 1–100 characters.
  - `media`: Optional media object (`url`, `type`).
- `questionMedia`: Optional media for the question itself.
- `settings.allowMultiple`: Optional boolean (default: `false`).
- `settings.showResults`: Optional — `"always"` | `"after_vote"` | `"after_close"` (default: `"after_vote"`).
- `expiresAt`: Optional ISO date string (max 30 days from now).

**Response (201):** `{ "success": true, "data": { /* Poll document */ } }`

**Side effects:** Emits `newPoll` (Socket.IO) globally.

---

### Get All Polls

**GET** `/api/polls`

Returns a paginated list of polls.

**Query Parameters:**
- `status` (optional): `"active"` | `"expired"` | `"closed"` | `"all"` (default: `"all"`)
- `page` (optional, default: `1`)
- `limit` (optional, default: `20`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "polls": [ /* Array of poll documents */ ],
    "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
  }
}
```

---

### Get My Polls

**GET** `/api/polls/me`

Get polls created by the authenticated user.

**Response (200):** `{ "success": true, "data": { "polls": [...] } }`

---

### Get Single Poll

**GET** `/api/polls/:id`

Get a specific poll with full option details, vote counts, and the authenticated user's vote (if any).

**Params:** `id` — MongoDB ObjectId

**Response (200):** `{ "success": true, "data": { /* Poll with userVote, percentages */ } }`

---

### Vote on Poll

**POST** `/api/polls/:id/vote`

Submit a vote. Respects `allowMultiple` setting.

**Request Body:**
```json
{
  "optionIndices": [0]
}
```

- `optionIndices`: **Required.** Array of zero-based option indices (positions in the `options` array). Currently must contain exactly one index.
- Cannot vote on expired polls.
- Cannot vote more than once on the same poll.

**Response (200):** `{ "success": true, "data": { /* Updated poll */ } }`

**Side effects:** Emits `pollVoted` and `feed:engagement-update` (Socket.IO) globally.

---

### Update Poll

**PUT** `/api/polls/:id`

Update poll metadata (author only).

**Request Body (all optional):**
```json
{
  "question": "New question text",
  "expiresAt": "2024-12-20T23:59:59Z"
}
```

**Side effects:** Emits `pollUpdated` (Socket.IO) globally.

**Response (200):** `{ "success": true, "data": { /* Updated poll */ } }`

---

### Delete Poll

**DELETE** `/api/polls/:id`

Delete a poll (author only).

**Side effects:** Emits `pollDeleted` and `feed:content-deleted` (Socket.IO) globally.

**Response (200):** `{ "success": true, "message": "Poll deleted successfully" }`

---

## Poll Status Lifecycle

```
active → expired (automatic, via cron job in jobs/poll.cron.ts)
active → closed  (manual close, if implemented)
```

The cron job runs at server startup via `startPollExpiryJob()` and periodically marks stale polls as `"expired"`.

---

## Error Responses

| Status | Meaning                                     |
|--------|---------------------------------------------|
| 400    | Validation error (wrong option count, etc.) |
| 401    | No or invalid Clerk JWT                     |
| 403    | Voting on expired poll; editing another user's poll |
| 404    | Poll not found                              |
| 409    | Already voted on this poll                  |

---

## Related Endpoints

- Comments: `GET /api/comments/Poll/:pollId`
- Reactions: `GET /api/reactions/Poll/:pollId`
- User's polls: `GET /api/profile/:username/polls`
