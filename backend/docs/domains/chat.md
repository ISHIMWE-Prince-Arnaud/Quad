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

## Data model + invariants

Model: `backend/src/models/ChatMessage.model.ts`

- `author` is an embedded snapshot.
- `text` is required by a Mongoose `pre("save")` hook.
- `mentions: string[]` is stored on the message row.
- Edit tracking:
  - `isEdited`
  - `editedAt`

Indexes:

- `createdAt` (pagination)
- `author.clerkId` (author history)
- `mentions` (mention queries)

## Send message: `POST /api/chat/messages`

Controller:

- Reads `userId` and validated body.
- Calls `ChatService.sendMessage(userId, messageData)`.

Request contract (validated by `createMessageSchema`):

- Body:
  - `content`: non-empty string
  - `receiverId`: required string (recipient user ID)

Response contract:

- `201` (implementation returns formatted message):
  - `{ success: true, data: FormattedChatMessage }` (see `formatMessageResponse` in `chat.util.ts`)

Service:

- Loads author `User`.
- Sanitizes message text (`sanitizeMessageText`).
- Extracts mentions.
- Creates `ChatMessage`.
- Formats response (`formatMessageResponse`).

Side effects:

- Mention notifications (`chat_mention`).
- Emits `chat:message:new` with formatted message globally.

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 User not found`.
- `400 Message must have content` (sanitization produced empty).

## Get messages: `GET /api/chat/messages`

- Supports cursor-based pagination via `cursor` (translates to `createdAt < cursor.createdAt`).
- Requires `otherUserId` to scope the message history.
- Returns messages in chronological order.

Request contract (validated by `getMessagesQuerySchema`):

- Query:
  - `otherUserId`: required non-empty string
  - `limit`: string -> number, default 20, must be 1-50
  - `cursor?`: 24-hex message id

Response contract:

- `200`:
  - `{ success: true, data: FormattedChatMessage[], nextCursor }`

## Edit message: `PUT /api/chat/messages/:id`

- Author-only.
- Sanitizes edited text.
- Sets `isEdited`, `editedAt`.

Side effects:

- Emits `chat:message:edited`.

Request contract (validated by `messageIdSchema` + `updateMessageSchema`):

- Params:
  - `id`: 24-hex
- Body:
  - `content`: required string

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Only the author can edit this message`.
- `404 Message not found`.
- `400 Message must have content after editing`.

## Delete message: `DELETE /api/chat/messages/:id`

- Author-only.
- Emits `chat:message:deleted` with id.

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Only the author can delete this message`.
- `404 Message not found`.

> **Note:** There is **no** mark-as-read endpoint for chat. Chat does not support read receipts at the REST layer.

## Typing indicators (Socket.IO)

- `chat:typing:start` and `chat:typing:stop`
- Stored in-memory per socket.
- Broadcast to all other clients.

Payloads:

- `chat:typing:start`: `{ userId, username }`
- `chat:typing:stop`: `{ userId }`

## Related docs

- Realtime spec: `backend/docs/REALTIME_SPEC.md`
- Notifications: `backend/docs/domains/notifications.md`
