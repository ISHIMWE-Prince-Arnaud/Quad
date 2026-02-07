# Reactions API Documentation

Toggle reactions on content and list aggregated reaction data.

## 4dd Endpoints

### Toggle reaction
**POST** `/api/reactions`

### Get my reactions
**GET** `/api/reactions/me`

### Get reactions by content
**GET** `/api/reactions/:contentType/:contentId`

### Delete reaction
**DELETE** `/api/reactions/:contentType/:contentId`

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/reaction.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/body
- **401** missing/invalid auth
- **404** content not found (if enforced by service)
