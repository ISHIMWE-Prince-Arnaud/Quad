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

## Data model + invariants

Model: `backend/src/models/Notification.model.ts`

- `userId`: recipient Clerk id
- `actorId?`: actor Clerk id
- `type`: string (domain-defined; see `generateNotificationMessage`)
- `contentId?`, `contentType?`: strings for deep-linking
- `isRead`: boolean

Important realtime invariant:

- `createNotification(...)` always follows up by emitting an **authoritative** `notification:unread_count` based on a DB count.

## Get notifications: `GET /api/notifications`

Flow:

- Middleware validates query via `getNotificationsQuerySchema`.
- Controller reads `currentUserId`.
- Service builds filter:
  - `userId`
  - `isRead=false` when `unreadOnly`.
- Uses `getPaginatedData`.
- Fetches actors in bulk from `User` and injects `actor` in each returned item.

Request contract (validated by `getNotificationsQuerySchema`):

- Query:
  - `page`: string -> number, default 1, must be > 0
  - `limit`: string -> number, default 20, must be 1-50
  - `unreadOnly`: string -> boolean, default false

Response contract:

- `200`:
  - `{ success: true, data: NotificationWithActor[], pagination }`

Failure modes:

- `401 Unauthorized`: missing auth.

## Get unread count: `GET /api/notifications/unread-count`

- Controller calls `NotificationService.getUnreadCount`.
- Service calls `getUnreadCount` utility (Mongo count).

Response contract:

- `200`:
  - `{ success: true, data: { unreadCount: number } }`

## Mark as read: `PATCH /api/notifications/:id/read`

- Service updates a single notification scoped to user.
- Controller emits realtime:
  - `emitNotificationRead(userId, id)`
  - which emits `notification:read` and then `notification:unread_count`.

Request contract:

- Params:
  - `id`: non-empty string

Response contract:

- `200`:
  - `{ success: true, message: "Notification marked as read" }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 Notification not found` (scoped to current user).

## Mark all as read: `PATCH /api/notifications/read-all`

- Service calls `markNotificationsAsRead` utility.
- Controller emits `notification:read_all` and then `notification:unread_count`.

Response contract:

- `200`:
  - `{ success: true, message: "{count} notification(s) marked as read", data: { count } }`

## Delete notification: `DELETE /api/notifications/:id`

- Service deletes scoped to user.
- Controller emits `notification:deleted` and then `notification:unread_count`.

Response contract:

- `200`:
  - `{ success: true, message: "Notification deleted" }`

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 Notification not found` (scoped to current user).

## Delete all read: `DELETE /api/notifications/read`

- Service calls `deleteReadNotifications` utility.
- Controller emits `notification:clear_read` and then `notification:unread_count`.

Response contract:

- `200`:
  - `{ success: true, message: "{count} read notification(s) deleted", data: { count } }`

## Realtime join semantics

Socket handlers: `backend/src/sockets/notification.socket.ts`

- Client emits:
  - `notification:join` with `userId`
  - server joins the socket to a room named exactly `userId`
- On join, server best-effort emits:
  - `notification:unread_count` with `{ unreadCount }`
- Client may emit:
  - `notification:leave` with `userId`

Emitted notification events:

- `notification:new`
- `notification:unread_count`
- `notification:read`
- `notification:read_all`
- `notification:deleted`
- `notification:clear_read`

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
