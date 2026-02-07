# Bookmark (`Bookmark.model.ts`)

## Collection

- Model: `Bookmark`

## Fields

- `userId: string` (required)
- `contentType: "post" | "story" | "poll"` (required)
- `contentId: string` (required)
- `createdAt` via timestamps (no `updatedAt`)

## Indexes

- Unique: `userId: 1, contentType: 1, contentId: 1`
- `userId: 1, createdAt: -1`
- `contentType: 1, contentId: 1, createdAt: -1`

## Invariants / notes

- Unique index enforces one bookmark per user per content.
