# Feed API Documentation

Personalized feed endpoints.

## 4dd Endpoints

### Get feed (defaults to For You)
**GET** `/api/feed`

Query params validated by `feedQuerySchema`.

### Get following feed
**GET** `/api/feed/following`

### Get For You feed
**GET** `/api/feed/foryou`

### Get new content count
**GET** `/api/feed/new-count`

Query params validated by `newCountQuerySchema`.

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/feed.schema.ts`.

## 6a8 Common failure modes

- **400** invalid query
- **401** missing/invalid auth
