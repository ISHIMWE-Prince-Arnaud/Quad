# Upload API Documentation

Multipart upload endpoints backed by Cloudinary.

## 4dd Endpoints

### Upload post media
**POST** `/api/upload/post`

Multipart form field: `file`.

### Upload story media
**POST** `/api/upload/story`

Multipart form field: `file`.

### Upload poll media
**POST** `/api/upload/poll`

Multipart form field: `file`.

### Upload profile image
**POST** `/api/upload/profile`

Multipart form field: `file`.

### Upload cover image
**POST** `/api/upload/cover`

Multipart form field: `file`.

### Delete file
**DELETE** `/api/upload`

Body: `{ "url": "<cloudinary_url>" }`.

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 6a8 Common failure modes

- **400** missing/invalid file
- **401** missing/invalid auth
