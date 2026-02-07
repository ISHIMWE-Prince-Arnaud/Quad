# Notifications (Frontend Internal Flow)

## Entry points

- Page: `frontend/src/pages/NotificationsPage.tsx`
- Controller hook: `frontend/src/pages/notifications/useNotificationsController.ts`
- Store:
  - `frontend/src/stores/notificationStore.ts` (unread count)
- Service:
  - `frontend/src/services/notificationService.ts`
- Realtime join + global listeners:
  - `frontend/src/layouts/RootLayout.tsx`
  - `frontend/src/lib/socket.ts`

## REST integration

- List:
  - `NotificationService.getNotifications({ page, limit, unreadOnly })`
- Mutations:
  - `NotificationService.markAsRead(id)` (optimistic)
  - `NotificationService.markAllAsRead()` (optimistic)
  - `NotificationService.deleteNotification(id)` (optimistic)
  - `NotificationService.deleteAllRead()` (optimistic)

## Realtime integration

### Room join

Performed in `RootLayout` once auth is ready:

- `socket.emit("notification:join", userId)`
- `socket.emit("notification:leave", userId)` on cleanup

### Global listeners (RootLayout)

- `notification:new`
  - shows a toast
- `notification:unread_count`
  - updates unread count in `notificationStore`

### Page-level listeners (`useNotificationsController`)

- `notification:new`
  - prepends notification (respects current filter)
- `notification:read`
  - marks read in-place or removes from list if in unread tab
- `notification:deleted`
  - removes notification
- `notification:read_all`
  - marks all as read (or clears list if in unread tab)
- `notification:clear_read`
  - removes read notifications from list

## Reconciliation rules

- Unread count is treated as authoritative from socket events.
- The list is best-effort:
  - optimistic updates on user actions
  - realtime events update local list for multi-tab/multi-device consistency
