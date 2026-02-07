# User (`User.model.ts`)

## Collection

- Model: `User`
- Primary key: Mongo `_id`
- Domain identifier: `clerkId` (unique)

## Fields

- `clerkId: string` (required, unique)
- `username: string` (required, unique, trimmed)
- `email: string` (required, unique)
- `displayName?: string`
- `firstName?: string`
- `lastName?: string`
- `profileImage: string` (default random avatar URL)
- `coverImage?: string`
- `bio?: string`
- `isVerified: boolean` (default `false`)
- `followersCount: number` (default `0`, min `0`)
- `followingCount: number` (default `0`, min `0`)
- `createdAt`, `updatedAt` via timestamps

## Indexes

- Unique indexes: `clerkId`, `username`, `email` (declared on fields)
- Additional:
  - `createdAt: -1`

## Invariants / notes

- `clerkId` is the authoritative user identity across the backend.
- Username uniqueness is enforced by the unique index.
- Profile image is always present due to the default.
