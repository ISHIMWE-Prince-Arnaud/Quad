# Notifications (Internal Flow)

## Entry points

REST:

- Route: `backend/src/routes/notification.routes.ts`
- Controller: `backend/src/controllers/notification.controller.ts`
- Service: `backend/src/services/notification.service.ts`
- Model: `backend/src/models/Notification.model.ts`
- Schema: `backend/src/schemas/notification.schema.ts`

Realtime:

- Socket join/leave: `backend/src/sockets/notification.socket.ts`
- Emission utils: `backend/src/utils/notification.util.ts`

## Get notifications: `GET /api/notifications`

Flow:

- Middleware validates query via `getNotificationsQuerySchema`.
- Controller reads `currentUserId`.
- Service builds filter:
  - `userId`
  - `isRead=false` when `unreadOnly`.
- Uses `getPaginatedData`.
- Fetches actors in bulk from `User` and injects `actor` in each returned item.

## Get unread count: `GET /api/notifications/unread-count`

- Controller calls `NotificationService.getUnreadCount`.
- Service calls `getUnreadCount` utility (Mongo count).

## Mark as read: `PATCH /api/notifications/:id/read`

- Service updates a single notification scoped to user.
- Controller emits realtime:
  - `emitNotificationRead(userId, id)`
  - which emits `notification:read` and then `notification:unread_count`.

## Mark all as read: `PATCH /api/notifications/read-all`

- Service calls `markNotificationsAsRead` utility.
- Controller emits `notification:read_all` and then `notification:unread_count`.

## Delete notification: `DELETE /api/notifications/:id`

- Service deletes scoped to user.
- Controller emits `notification:deleted` and then `notification:unread_count`.

## Delete all read: `DELETE /api/notifications/read`

- Service calls `deleteReadNotifications` utility.
- Controller emits `notification:clear_read` and then `notification:unread_count`.

## Where notifications are created

The backend creates notifications from other services using:

- `createNotification(...)` in `backend/src/utils/notification.util.ts`

Examples:

- Follow: creates `follow` notifications.
- Posts: mention notifications (`mention_post`).
- Stories: mention notifications (`mention_story`).
- Comments: content owner comment notifications + mention notifications (`mention_comment`).
- Reactions: reaction notifications (`reaction_post`, `reaction_story`, `reaction_poll`).
- Polls: milestone notifications (`poll_milestone`).
- Chat: mention notifications (`chat_mention`).

## Related docs

- Realtime spec: `backend/docs/REALTIME_SPEC.md`
