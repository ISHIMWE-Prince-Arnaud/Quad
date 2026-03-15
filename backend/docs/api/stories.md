# Stories API

Long-form content with draft and published states.

> **Rate limit:** `writeRateLimiter` applies to POST/PUT/DELETE.

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

---

### Create Story

**POST** `/api/stories`

Create a new story. Stories can be saved as `"draft"` or published immediately as `"published"`.

**Request Body:**
```json
{
  "title": "Story Title",
  "content": "Full story body here...",
  "excerpt": "Short summary",
  "coverImage": {
    "url": "https://res.cloudinary.com/.../cover.jpg",
    "publicId": "quad/stories/cover123"
  },
  "status": "published",
  "tags": ["tech", "learning"]
}
```

- `title`: **Required.** String.
- `content`: **Required.** String.
- `excerpt`: Optional string.
- `coverImage`: Optional object with `url` and `publicId`.
- `status`: Optional, `"draft"` | `"published"` (default: `"draft"`).
- `tags`: Optional array of strings.

**Response (201):** `{ "success": true, "data": { /* Story document */ } }`

**Side effects:** If `status` is `"published"`, emits `newStory` (Socket.IO) globally.

---

### Get All Published Stories

**GET** `/api/stories`

Returns a paginated list of published stories (no drafts).

**Query Parameters:**
- `limit` (optional, default: `20`)
- `skip` (optional, default: `0`)

**Response (200):** `{ "success": true, "data": { "stories": [...] } }`

---

### Get My Stories

**GET** `/api/stories/me`

Get stories created by the authenticated user, **including drafts**.

**Query Parameters:**
- `status` (optional): `"draft"` | `"published"` — filter by status.
- `limit` (optional, default: `20`)
- `skip` (optional, default: `0`)

**Response (200):** `{ "success": true, "data": { "stories": [...] } }`

---

### Get Single Story

**GET** `/api/stories/:id`

Retrieve a single published story by ID. Auto-increments the view count if the viewer is not the author.

**Params:** `id` — MongoDB ObjectId

**Response (200):** `{ "success": true, "data": { /* Story document with view count */ } }`

---

### Update Story

**PUT** `/api/stories/:id`

Update a story (author only). You can transition a `draft` to `published` by setting `status`.

**Params:** `id` — MongoDB ObjectId

**Request Body:** Same fields as Create (all optional).

**Side effects:** If updated story is `"published"`, emits `storyUpdated`. If transitioning draft → published, emits `newStory`.

**Response (200):** `{ "success": true, "data": { /* Updated story */ } }`

---

### Delete Story

**DELETE** `/api/stories/:id`

Delete a story and all associated views (author only).

**Side effects:** Emits `storyDeleted` (Socket.IO) globally if the deleted story was published.

**Response (200):** `{ "success": true, "message": "Story deleted successfully" }`

---

## Error Responses

| Status | Meaning                             |
|--------|-------------------------------------|
| 400    | Validation error                    |
| 401    | No or invalid Clerk JWT             |
| 403    | Updating/deleting another author's story |
| 404    | Story not found                     |

---

## Related Endpoints

- User's published stories: `GET /api/profile/:username/stories`
- Comments on a story: `GET /api/comments/Story/:storyId`
- Reactions: `GET /api/reactions/Story/:storyId`
