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
    - `ReactionService.toggleReaction()` / `ReactionService.deleteReaction()` (post + poll)
    - `CommentService.createComment()` / `CommentService.deleteComment()` (post only)

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

Chat message lifecycle events are emitted from `backend/src/services/chat.service.ts` (global):

- **`chat:message:new`**
  - Payload: formatted message (see `formatMessageResponse` in `backend/src/utils/chat.util.ts`)
  - Emitted by: `ChatService.sendMessage()`

- **`chat:message:edited`**
  - Payload: formatted message
  - Emitted by: `ChatService.editMessage()`

- **`chat:message:deleted`**
  - Payload: `id: string` (message id)
  - Emitted by: `ChatService.deleteMessage()`

## Integration points in REST services

Services emit realtime events directly:

Services emit a mix of legacy/global events and `feed:*` events.

### Legacy/global events (emitted to all clients)

These are `io.emit(...)` calls from services and are not room-scoped.

#### Posts (`backend/src/services/post.service.ts`)

- **`newPost`**
  - Payload: `Post` document
  - When: post created
- **`updatePost`**
  - Payload: updated `Post` document
  - When: post updated
- **`deletePost`**
  - Payload: `id: string`
  - When: post deleted

#### Polls (`backend/src/services/poll.service.ts`)

- **`newPoll`**
  - Payload: `Poll` document
  - When: poll created
- **`pollUpdated`**
  - Payload: formatted poll response
  - When: poll updated
- **`pollDeleted`**
  - Payload: `id: string`
  - When: poll deleted
- **`pollVoted`**
  - Payload:
    - `pollId: string`
    - `updatedVoteCounts: number[]`
    - `totalVotes: number`
  - When: a vote is recorded

#### Stories (`backend/src/services/story.service.ts`)

- **`newStory`**
  - Payload: `Story` document
  - When: story created/published or transitioned to published
- **`storyUpdated`**
  - Payload: `Story` document
  - When: published story updated
- **`storyDeleted`**
  - Payload: `id: string`
  - When: published story deleted

#### Comments (`backend/src/services/comment.service.ts`)

- **`commentAdded`**
  - Payload: `{ contentType, contentId, comment }`
  - When: comment created
- **`commentUpdated`**
  - Payload: `{ contentType, contentId, commentId, comment }`
  - When: comment updated
- **`commentDeleted`**
  - Payload: `{ contentType, contentId, commentId }`
  - When: comment deleted

- **`commentLikeAdded`**
  - Payload: `{ commentId, userId, likesCount }`
  - When: comment like created
- **`commentLikeRemoved`**
  - Payload: `{ commentId, userId, likesCount }`
  - When: comment like removed

#### Reactions (`backend/src/services/reaction.service.ts`)

- **`reactionAdded`**
  - Payload: `{ contentType, contentId, userId, type, reaction, reactionCount }`
  - When: reaction created
- **`reactionUpdated`**
  - Payload: `{ contentType, contentId, userId, type, reaction }`
  - When: reaction type updated (currently only `love` exists)
- **`reactionRemoved`**
  - Payload: `{ contentType, contentId, userId, reactionCount }`
  - When: reaction removed (toggle off) or deleted explicitly

#### Follow (`backend/src/services/follow.service.ts`)

- **`follow:new`**
  - Payload: `{ userId, followingId }`
  - When: follow created
- **`follow:removed`**
  - Payload: `{ userId, followingId }`
  - When: follow removed

### Feed events

In addition to the legacy/global events above:

- Posts and Polls emit:
  - `feed:new-content`
  - `feed:content-deleted`
- Poll votes + some engagement updates emit:
  - `feed:engagement-update`

## Known inconsistencies to be aware of

- Feed rooms are joined but feed events are currently emitted globally, not to `feed:${userId}` rooms.
- There are legacy event names (`newPost`, `updatePost`, `deletePost`, `newPoll`, etc.) in addition to `feed:*` events.

If you want, I can add a follow-up doc section proposing a consistent room + event strategy, but this document is intentionally describing the current implementation.
