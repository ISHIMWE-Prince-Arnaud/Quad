# Chat (Frontend Internal Flow)

## Entry points

- Page: `frontend/src/pages/ChatPage.tsx`
- Realtime hook: `frontend/src/pages/chat/useChatSocket.ts`
- REST service: `frontend/src/services/chatService.ts`
- Socket client singleton: `frontend/src/lib/socket.ts`

## REST integration

- Initial history and pagination:
  - `ChatService.getMessages(...)` is used to load messages.
- Mutations:
  - `ChatService.sendMessage(...)`
  - `ChatService.editMessage(...)`
  - `ChatService.deleteMessage(...)`

## Realtime integration

`useChatSocket` registers and handles:

- Connection lifecycle:
  - `connect`, `disconnect`, `connect_error`, `reconnect_attempt`

- Message lifecycle:
  - `chat:message:new`
    - Dedupes by `id` before appending.
  - `chat:message:edited`
    - Replaces message in-place by `id`.
  - `chat:message:deleted`
    - Removes message by `id`.

- Typing indicators:
  - listens to `chat:typing:start` / `chat:typing:stop`
  - emits `chat:typing:start` with `{ userId, username }`
  - emits `chat:typing:stop` with `{ userId }`

## UI behaviors

- If the user is near the bottom, incoming messages trigger a scroll-to-bottom.
- Typing users auto-expire after a timeout.

## Reconciliation rules

- Realtime events update the in-memory list.
- REST remains authoritative for pagination and initial load.
