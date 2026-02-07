# CommentLike (`CommentLike.model.ts`)

## Collection

- Model: `CommentLike`

## Fields

- `commentId: string` (required)
- `userId: string` (required)
- `username: string` (required)
- `createdAt`, `updatedAt` via timestamps

## Indexes

- Unique: `commentId: 1, userId: 1`
- `commentId: 1, createdAt: -1`
- `userId: 1, createdAt: -1`

## Invariants / notes

- Enforces one like per user per comment via unique index.
- Updates should keep `Comment.likesCount` consistent.
