# Upload API

Upload media files (images and videos) to Cloudinary for use in posts, stories, polls, and user profiles.

> **Rate limit:** `uploadRateLimiter` is applied to all `/api/upload` routes (configurable, default: 20 requests per 15 minutes).

## Endpoints

All endpoints require `Authorization: Bearer <clerk_jwt_token>`.

All upload endpoints accept `multipart/form-data` with a single `file` field.

---

### Upload Post Media

**POST** `/api/upload/post`

Upload an image or video to be attached to a post.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: **Required.** Image or video file.
- `aspectRatio` (optional): Cloudinary transformation hint — `"1:1"` | `"16:9"` | `"9:16"`.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "quad/posts/abc123",
    "type": "image",
    "width": 1080,
    "height": 1080
  }
}
```

---

### Upload Story Media

**POST** `/api/upload/story`

Upload an image or video for a story.

**Form Fields:** Same as Post Media.

**Response (200):** Same structure as Post Media.

---

### Upload Poll Media

**POST** `/api/upload/poll`

Upload media for a poll question or option.

**Form Fields:** Same as Post Media.

**Response (200):** Same structure as Post Media.

---

### Upload Profile Image

**POST** `/api/upload/profile`

Upload a user's profile avatar image.

**Form Fields:**
- `file`: **Required.** Image file only.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/.../profile.jpg",
    "publicId": "quad/profiles/user123"
  }
}
```

---

### Upload Cover Image

**POST** `/api/upload/cover`

Upload a user's profile cover/banner image.

**Form Fields:**
- `file`: **Required.** Image file only.

**Response (200):** Same structure as Profile Image.

---

### Delete File

**DELETE** `/api/upload`

Delete a previously uploaded file from Cloudinary by its URL.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "url": "https://res.cloudinary.com/quad/posts/abc123.jpg"
}
```

**Response (200):** `{ "success": true, "message": "File deleted" }`

---

## File Type Restrictions (Multer)

Configured in `backend/src/middlewares/multer.middleware.ts`. Accepted types include common image formats (JPEG, PNG, GIF, WebP) and video formats (MP4, MOV, WebM). Size limits are enforced at the server level.

---

## Error Responses

| Status | Meaning                                   |
|--------|-------------------------------------------|
| 400    | No file uploaded, unsupported format      |
| 401    | No or invalid Clerk JWT                   |
| 413    | File exceeds size limit                   |
| 500    | Cloudinary upload failure                 |
