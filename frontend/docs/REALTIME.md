# Frontend Realtime (Socket.IO)

This document describes how the frontend uses Socket.IO.

## Socket client

- Module: `frontend/src/lib/socket.ts`
- Export: `getSocket()`

The socket is a singleton (`let socket: Socket | null`).

### Socket URL

The socket server URL is derived from the API base URL:

- API base URL: `VITE_API_BASE_URL` (default `http://localhost:4000/api`)
- Socket URL: API base URL with `/api` removed
  - Implemented as: `API_BASE_URL.replace(/\/\/_?api\/?$/, "")`

Socket initialization options:

- `transports`: `websocket`, `polling`
- `withCredentials: true`
- `autoConnect: true`

## Joining rooms

The app joins rooms in `frontend/src/layouts/RootLayout.tsx` after auth is ready.

Rooms joined:

- `feed:join` / `feed:leave`
- `notification:join` / `notification:leave`

Join uses the current user’s Clerk id: `user?.clerkId`.

The layout also re-joins on reconnect via `socket.on("connect", joinRooms)`.

Rooms joined are keyed by the current user’s Clerk id.

- Feed room join/leave:
  - `feed:join` / `feed:leave` with payload `userId: string`
- Notification room join/leave:
  - `notification:join` / `notification:leave` with payload `userId: string`

Note: The backend currently emits `feed:*` events globally (not room-scoped), but the frontend still joins `feed:${userId}` for forward compatibility.

## Events handled in RootLayout

- `notification:new`
  - Displays a toast using `react-hot-toast`.
- `notification:unread_count`
  - Updates Zustand unread count.
- `follow:new`
- `follow:removed`
  - Applies optimistic relationship updates in `followStore`.

## Notifications page realtime

In addition to `RootLayout`, the notifications page controller listens to:

- `notification:read`
- `notification:deleted`
- `notification:read_all`
- `notification:clear_read`

See `frontend/src/pages/notifications/useNotificationsController.ts`.

## Feed realtime

The feed listens to realtime events inside `useFeedController`:

- `feed:new-content`
- `feed:engagement-update`
- `feed:content-deleted`

These events refresh or update in-memory feed items.

See `frontend/src/pages/app/feed/useFeedController.ts`.

## Chat realtime

Chat listens and emits typing + message lifecycle events:

- Listens:
  - `chat:message:new`
  - `chat:message:edited`
  - `chat:message:deleted`
  - `chat:typing:start`
  - `chat:typing:stop`
- Emits:
  - `chat:typing:start` with `{ userId, username }`
  - `chat:typing:stop` with `{ userId }`

See `frontend/src/pages/chat/useChatSocket.ts`.

## Troubleshooting

See shared troubleshooting doc:

- `docs/TROUBLESHOOTING.md`
