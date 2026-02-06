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

## Joining rooms

The app joins rooms in `frontend/src/layouts/RootLayout.tsx` after auth is ready.

Rooms joined:

- `feed:join` / `feed:leave`
- `notification:join` / `notification:leave`

Join uses the current user’s Clerk id: `user?.clerkId`.

The layout also re-joins on reconnect via `socket.on("connect", joinRooms)`.

## Events handled in RootLayout

- `notification:new`
  - Displays a toast using `react-hot-toast`.
- `notification:unread_count`
  - Updates Zustand unread count.
- `follow:new`
- `follow:removed`
  - Applies optimistic relationship updates in `followStore`.

## Feed realtime

The feed listens to realtime events inside `useFeedController`:

- `feed:new-content`
- `feed:engagement-update`
- `feed:content-deleted`

These events refresh or update in-memory feed items.

## Troubleshooting

See shared troubleshooting doc:

- `docs/TROUBLESHOOTING.md`
