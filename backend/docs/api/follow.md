# Follow API Documentation

Follow/unfollow and follow list endpoints.

## 4dd Endpoints

### Follow a user
**POST** `/api/follow/:userId`

### Unfollow a user
**DELETE** `/api/follow/:userId`

### Get followers
**GET** `/api/follow/:userId/followers`

Query params are validated by `getFollowListQuerySchema`.

### Get following
**GET** `/api/follow/:userId/following`

Query params are validated by `getFollowListQuerySchema`.

### Check following
**GET** `/api/follow/:userId/check`

### Get follow stats
**GET** `/api/follow/:userId/stats`

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/follow.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/query
- **401** missing/invalid auth
- **404** target user not found
- **409** already following (if enforced by service)
