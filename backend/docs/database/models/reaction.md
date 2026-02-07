# Reaction (`Reaction.model.ts`)

## Collection

- Model: `Reaction`

## Fields

- `contentType: "post" | "story" | "poll" | "comment"` (required)
- `contentId: string` (required)
- `userId: string` (required)
- `username: string` (required)
- `profileImage?: string`
- `type: "love"` (required)
- `createdAt`, `updatedAt` via timestamps

## Indexes

- `contentType: 1, contentId: 1, createdAt: -1`
- Unique: `contentType: 1, contentId: 1, userId: 1`
- `userId: 1, createdAt: -1`
- `type: 1`
- `contentId: 1, type: 1`

## Invariants / notes

- Unique compound index enforces one reaction per user per content.
- Cached counters on content docs must remain consistent.
