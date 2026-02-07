# Story (`Story.model.ts`)

## Collection

- Model: `Story`

## Fields

- `userId: string` (required)
- `author: object` (required; embedded user snapshot)
- `title: string` (required, trimmed, max 200)
- `content: string` (required)
- `excerpt?: string` (trimmed, max 500)
- `coverImage?: string`
- `status: "draft" | "published"` (default `draft`)
- `tags: string[]` (trimmed, lowercased)
- `readTime?: number` (min 0)
- `reactionsCount: number` (default `0`)
- `commentsCount: number` (default `0`)
- `publishedAt?: Date`
- `createdAt`, `updatedAt` via timestamps

## Indexes

- `status: 1, publishedAt: -1`
- `userId: 1, createdAt: -1`
- `userId: 1, status: 1, publishedAt: -1`
- `tags: 1, status: 1, publishedAt: -1`

## Invariants / notes

- Pre-save hook maintains publishing timestamps:
  - When first published: sets `publishedAt`.
  - When reverted to draft: clears `publishedAt`.
- `author` is denormalized (snapshot propagation applies).
