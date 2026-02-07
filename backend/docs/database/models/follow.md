# Follow (`Follow.model.ts`)

## Collection

- Model: `Follow`

## Fields

- `userId: string` (required) — follower
- `followingId: string` (required) — followed user
- `createdAt` via timestamps (no `updatedAt`)

## Indexes

- Unique: `userId: 1, followingId: 1`
- `followingId: 1, createdAt: -1`
- `userId: 1, createdAt: -1`

## Invariants / notes

- Pre-save hook rejects self-follow (`userId === followingId`).
- Cached counters on `User` (`followersCount`, `followingCount`) should remain consistent.
