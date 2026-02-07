# Profile API Documentation

Public profile retrieval plus "user content" listing endpoints.

## 4dd Endpoints

### Get profile by ID
**GET** `/api/profile/id/:userId`

Convenience endpoint for profile lookup by Clerk ID.

### Get profile by username
**GET** `/api/profile/:username`

Returns profile for a username.

### Update profile
**PUT** `/api/profile/:username`

Updates the authenticated user's profile.

### Get user's posts
**GET** `/api/profile/:username/posts`

Supports pagination query params (validated by `paginationQuerySchema`).

### Get user's stories
**GET** `/api/profile/:username/stories`

Supports pagination query params.

### Get user's polls
**GET** `/api/profile/:username/polls`

Supports pagination query params.

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/profile.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/body/query
- **401** missing/invalid auth
- **403** updating a profile that is not yours
- **404** user not found
