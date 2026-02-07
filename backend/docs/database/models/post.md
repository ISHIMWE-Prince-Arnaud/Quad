# Post (`Post.model.ts`)

## Collection

- Model: `Post`

## Fields

- `userId: string` (required)
- `author: object` (required; embedded user snapshot)
- `text?: string`
- `media: { url, type, aspectRatio? }[]`
  - `type` enum: `image` | `video`
  - `aspectRatio` enum: `1:1` | `16:9` | `9:16`
- `reactionsCount: number` (default `0`)
- `commentsCount: number` (default `0`)
- `createdAt`, `updatedAt` via timestamps

## Indexes

- `createdAt: -1`
- `userId: 1`
- `userId: 1, createdAt: -1`
- `createdAt: -1, reactionsCount: -1, commentsCount: -1`
- `userId: 1, createdAt: -1, reactionsCount: -1, commentsCount: -1`

## Invariants / notes

- `author` is denormalized and must be kept in sync when a user updates their profile (snapshot propagation).
- `reactionsCount` and `commentsCount` are cached counters.
