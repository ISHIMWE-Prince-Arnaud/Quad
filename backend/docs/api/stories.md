# Stories API Documentation

Long-form stories (draft + published).

## 4dd Endpoints

### Create story
**POST** `/api/stories`

### Get all published stories
**GET** `/api/stories`

Query params validated by `getStoriesQuerySchema`.

### Get my stories (includes drafts)
**GET** `/api/stories/me`

### Get single story
**GET** `/api/stories/:id`

### Update story
**PUT** `/api/stories/:id`

### Delete story
**DELETE** `/api/stories/:id`

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/story.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/body/query
- **401** missing/invalid auth
- **403** non-author update/delete
- **404** story not found
