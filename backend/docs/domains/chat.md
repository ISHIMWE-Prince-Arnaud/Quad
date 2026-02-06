# Chat (Internal Flow)

## Entry points

REST:

- Route: `backend/src/routes/chat.routes.ts`
- Controller: `backend/src/controllers/chat.controller.ts`
- Service: `backend/src/services/chat.service.ts`
- Model: `backend/src/models/ChatMessage.model.ts`
- Schema: `backend/src/schemas/chat.schema.ts`

Realtime:

- Socket typing: `backend/src/sockets/chat.socket.ts`
- Message broadcast: emitted from `ChatService` using `getSocketIO().emit(...)`

## Send message: `POST /api/chat/messages`

Controller:

- Reads `userId` and validated body.
- Calls `ChatService.sendMessage(userId, messageData)`.

Service:

- Loads author `User`.
- Sanitizes message text (`sanitizeMessageText`).
- Extracts mentions.
- Creates `ChatMessage`.
- Formats response (`formatMessageResponse`).

Side effects:

- Mention notifications (`chat_mention`).
- Emits `chat:message:new` with formatted message.

## Get messages: `GET /api/chat/messages`

- Supports:
  - page/limit pagination
  - cursor-like `before` (translates to `createdAt < beforeMessage.createdAt`)
- Returns messages in chronological order (reversed at end).

## Edit message: `PUT /api/chat/messages/:id`

- Author-only.
- Sanitizes edited text.
- Sets `isEdited`, `editedAt`.

Side effects:

- Emits `chat:message:edited`.

## Delete message: `DELETE /api/chat/messages/:id`

- Author-only.
- Emits `chat:message:deleted` with id.

## Mark as read: `POST /api/chat/read`

- Currently returns `{ lastReadMessageId, readAt }`.
- Does not persist read receipts to Mongo.

## Typing indicators (Socket.IO)

- `chat:typing:start` and `chat:typing:stop`
- Stored in-memory per socket.
- Broadcast to all other clients.

## Related docs

- Realtime spec: `backend/docs/REALTIME_SPEC.md`
- Notifications: `backend/docs/domains/notifications.md`
