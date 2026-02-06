# Frontend State Management

This document describes state management patterns used in the Quad frontend.

## Principle: local state first

Use React local state for state that:

- is scoped to one page/component
- is not shared across routes
- can be reset naturally on navigation

Example:

- Feed list state is handled locally by `useFeedController` (`frontend/src/pages/app/feed/useFeedController.ts`) rather than a global store.

## Global/domain state: Zustand

Zustand is used for domain state that is shared across multiple areas of the app.

Current stores:

- `frontend/src/stores/authStore.ts`
  - user session snapshot, loading, error
  - persisted to localStorage (`quad-auth-storage`)
- `frontend/src/stores/themeStore.ts`
  - theme preference (light/dark/system)
  - applies theme classes to the DOM
  - persisted (`quad-theme-storage`)
- `frontend/src/stores/notificationStore.ts`
  - unread count, unread count loading
  - fetch action using `NotificationService`
- `frontend/src/stores/followStore.ts`
  - follow relationships and follower/following counts
  - optimistic follow/unfollow
  - updates via socket events `follow:new` and `follow:removed`

## How global state is fed by realtime

`frontend/src/layouts/RootLayout.tsx` listens to socket events and updates stores:

- `notification:unread_count` -> `notificationStore.setUnreadCount`
- `follow:new` / `follow:removed` -> `followStore.applyFollow*Event`

The feed itself uses local state and listens to socket events inside `useFeedController`.

## Persistence

- Auth state uses `zustand/middleware/persist` to persist the `user` field.
- Theme state uses `persist`.
- Other stores are currently in-memory only.

## Recommended conventions

- Keep stores “thin”: domain state + domain actions.
- Put network calls in services and call them from stores or controllers.
- Avoid using stores as a dumping ground for page-scoped UI state.
