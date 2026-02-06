# Realtime (Socket.IO) Specification

This document describes the backend realtime implementation as it exists in code.

## Server initialization

Socket.IO is initialized in:

- `backend/src/server.ts`

Configuration:

- CORS: `getSocketCorsOptions()` from `backend/src/config/cors.config.ts`
- Transports: `websocket`, `polling`
- `pingTimeout`: 60000
- `pingInterval`: 25000

Handlers registered:

- `setupChatSocket(io)` -> `backend/src/sockets/chat.socket.ts`
- `setupNotificationSocket(io)` -> `backend/src/sockets/notification.socket.ts`
- `setupFeedSocket(io)` -> `backend/src/sockets/feed.socket.ts`

## Namespaces

The code uses the default namespace (`/`).

## Rooms

### Feed rooms

- Join event: `feed:join` with payload `userId: string`
- Leave event: `feed:leave` with payload `userId: string`

Server behavior (see `backend/src/sockets/feed.socket.ts`):

- `feed:join` -> `socket.join(\`feed:${userId}\`)`
- `feed:leave` -> `socket.leave(\`feed:${userId}\`)`

Note: the current emit functions in `feed.socket.ts` emit globally via `io.emit(...)` (not room-targeted).

### Notification rooms

- Join event: `notification:join` with payload `userId: string`
- Leave event: `notification:leave` with payload `userId: string`

Server behavior (see `backend/src/sockets/notification.socket.ts`):

- `notification:join` -> `socket.join(userId)`
  - Also emits `notification:unread_count` to the joining socket.
- `notification:leave` -> `socket.leave(userId)`

## Events

### Feed events

Defined in `backend/src/sockets/feed.socket.ts`.

- **`feed:new-content`**
  - Payload:
    - `contentType: "post" | "poll"`
    - `contentId: string`
    - `authorId: string`
    - `timestamp: string`
  - Emitted by:
    - `PostService.createPost()`
    - `PollService.createPoll()`

- **`feed:engagement-update`**
  - Payload:
    - `contentType: "post" | "poll"`
    - `contentId: string`
    - `reactionsCount?: number`
    - `commentsCount?: number`
    - `votes?: number`
    - `timestamp: string`
  - Emitted by:
    - `PollService.voteOnPoll()` (votes updates)
    - reaction/comment services may emit similar updates (verify per-service)

- **`feed:content-deleted`**
  - Payload:
    - `contentType: "post" | "poll"`
    - `contentId: string`
    - `timestamp: string`
  - Emitted by:
    - `PostService.deletePost()`
    - `PollService.deletePoll()`

### Notification events

Defined in `backend/src/sockets/notification.socket.ts`.

- **`notification:unread_count`**
  - Payload:
    - `unreadCount: number`
  - Emitted:
    - On `notification:join` to the joining socket.

Authoritative notification events are emitted from:

- `backend/src/utils/notification.util.ts`

These are emitted to the user’s notification room using `io.to(userId)`.

- **`notification:new`**
  - Payload: `INotificationWithActor`
    - Includes:
      - `id`, `userId`, `type`, `message`, `isRead`, `createdAt`
      - Optional: `actor`, `actorId`, `contentId`, `contentType`
  - Emitted when `createNotification(...)` is called.

- **`notification:unread_count`**
  - Payload:
    - `unreadCount: number`
  - Emitted:
    - after `notification:new`
    - after read/delete/clear operations (see below)

- **`notification:read`**
  - Payload:
    - `id: string`
  - Emitted when a single notification is marked read.

- **`notification:read_all`**
  - Payload: none
  - Emitted when all notifications are marked read.

- **`notification:deleted`**
  - Payload:
    - `id: string`
  - Emitted when a notification is deleted.

- **`notification:clear_read`**
  - Payload: none
  - Emitted when read notifications are cleared.

### Chat events

Defined in `backend/src/sockets/chat.socket.ts`.

- **`chat:typing:start`**
  - Received from client with:
    - `userId: string`
    - `username: string`
  - Server stores typing users per socket.
  - Server broadcasts to all other clients:
    - `chat:typing:start` with `{ userId, username }`

- **`chat:typing:stop`**
  - Received from client with:
    - `userId: string`
  - Server broadcasts to all other clients:
    - `chat:typing:stop` with `{ userId }`

## Integration points in REST services

Services emit realtime events directly:

- `backend/src/services/post.service.ts`
  - emits `newPost`, `updatePost`, `deletePost` (legacy/global events)
  - emits feed events via `emitNewContent` / `emitContentDeleted`

- `backend/src/services/poll.service.ts`
  - emits `newPoll`, `pollUpdated`, `pollDeleted`, `pollVoted`
  - emits feed events via `emitNewContent` / `emitContentDeleted` / `emitEngagementUpdate`

## Known inconsistencies to be aware of

- Feed rooms are joined but feed events are currently emitted globally, not to `feed:${userId}` rooms.
- There are legacy event names (`newPost`, `updatePost`, `deletePost`, `newPoll`, etc.) in addition to `feed:*` events.

If you want, I can add a follow-up doc section proposing a consistent room + event strategy, but this document is intentionally describing the current implementation.
