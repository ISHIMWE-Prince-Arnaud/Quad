# Notification (`Notification.model.ts`)

## Collection

- Model: `Notification`

## Fields

- `userId: string` (required)
- `type: NotificationType` (required)
- `actorId?: string`
- `contentId?: string`
- `contentType?: "Post" | "Story" | "Poll" | "Comment" | "ChatMessage"`
- `message: string` (required)
- `isRead: boolean` (default `false`)
- `createdAt` via timestamps (no `updatedAt`)

## Indexes

- `userId: 1, isRead: 1, createdAt: -1`
- `userId: 1, createdAt: -1`
- TTL: `createdAt: 1` with `expireAfterSeconds = 90 days`

## Invariants / notes

- TTL index enforces automatic cleanup of older notifications.
- Many notification types map to specific domain actions (follow, reactions, comments, mentions, poll expiry/milestones).
