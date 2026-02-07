# Chat API Documentation

Real-time messaging REST endpoints.

## 4dd Endpoints

### Send message
**POST** `/api/chat/messages`

### Get messages
**GET** `/api/chat/messages`

Query params validated by `getMessagesQuerySchema`.

### Edit message
**PUT** `/api/chat/messages/:id`

### Delete message
**DELETE** `/api/chat/messages/:id`

### Mark as read
**POST** `/api/chat/read`

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/chat.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/body/query
- **401** missing/invalid auth
- **403** editing/deleting message you do not own
- **404** message not found
