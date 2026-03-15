# Frontend State Management

This document describes the state management patterns used in the Quad frontend.

## Principle: Local State First

Use React local state (`useState`, `useReducer`, or custom hooks) for state that:

- is scoped to one component or route
- is not shared across distant parts of the React tree
- naturally resets on navigation (e.g. form inputs)

Example:
- The `FeedPage` component manages its own pagination, loading flags, and feed data locally instead of pushing it into a global store.

## Global/Domain State: Zustand

Zustand is used for global state that must be shared across multiple areas of the application.

All global stores are located in `frontend/src/stores/`.

### Current Stores

- **`authStore.ts`**
  - Manages the user session snapshot, loading state, and any authentication errors.
  - Persisted to localStorage under the key `quad-auth-storage`.
- **`themeStore.ts`**
  - Manages theme preference (`light | dark | system`), effective theme, and DOM class application with color interpolation transitions.
  - Persisted to localStorage under the key `quad-theme-storage`.
  - Also listens to `prefers-color-scheme` media queries and custom cross-tab storage events.
- **`notificationStore.ts`**
  - Manages the global unread counts badge.
  - Exposes actions like `fetchUnreadCount()`, `increment()`, and `decrement()`.
- **`followStore.ts`**
  - Caches follow relationships and tracks follower/following counts.
  - Handles optimistic follow/unfollow updates to make the UI feel instantaneous.
- **`socketStore.ts`**
  - Holds the global `Socket` instance from `socket.io-client`.

## Real-time Store Updates

`frontend/src/providers/SocketProvider.tsx` or `frontend/src/layouts/RootLayout.tsx` listens to global socket events to keep stores synchronized:

- `notification:unread_count` ➔ `useNotificationStore.getState().setUnreadCount(payload)`
- `follow:new` / `follow:removed` ➔ `useFollowStore.getState().applyFollowEvent(payload)`

## Persistence Mechanisms

- **`authStore`**: Uses the `zustand/middleware/persist` middleware.
- **`themeStore`**: Uses `persist` middleware alongside an event listener to synchronize across open browser tabs.
- **Other Stores**: Maintained strictly in-memory and are re-populated via REST queries or Socket events upon reload.

## Recommended Conventions

- **Keep stores thin**: Focus on holding domain data and domain-specific actions.
- **Isolate network logic**: Perform API calls in dedicated `services` rather than mixing HTTP fetching logic directly inside stores (except for very simple getters like `fetchUnreadCount`).
- **Encapsulate UI state**: Avoid using global Zustand stores as a dumping ground for transient UI state (like "is this modal open").
