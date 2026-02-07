# Comments API Documentation

Comment creation and management, plus comment likes.

## 4dd Endpoints

### Create comment
**POST** `/api/comments`

### Get comments by content
**GET** `/api/comments/:contentType/:contentId`

### Get comment by ID
**GET** `/api/comments/:id`

### Update comment
**PUT** `/api/comments/:id`

### Delete comment
**DELETE** `/api/comments/:id`

### Toggle comment like
**POST** `/api/comments/like`

### Get comment likes
**GET** `/api/comments/:id/likes`

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/comment.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/body
- **401** missing/invalid auth
- **403** non-author update/delete
- **404** comment/content not found
