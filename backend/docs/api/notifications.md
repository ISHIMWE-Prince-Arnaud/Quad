# Notifications API Documentation

Notification listing and state management.

## 4dd Endpoints

### Get notifications
**GET** `/api/notifications`

Query params validated by `getNotificationsQuerySchema`.

### Get unread count
**GET** `/api/notifications/unread-count`

### Mark all as read
**PATCH** `/api/notifications/read-all`

### Delete all read notifications
**DELETE** `/api/notifications/read`

### Mark a notification as read
**PATCH** `/api/notifications/:id/read`

### Delete a notification
**DELETE** `/api/notifications/:id`

## 510 Authentication

All endpoints require `Authorization: Bearer <jwt_token>`.

## 4cb Validation

Validation is enforced by Zod schemas in `backend/src/schemas/notification.schema.ts`.

## 6a8 Common failure modes

- **400** invalid params/query
- **401** missing/invalid auth
- **404** notification not found
