# Comment (`Comment.model.ts`)

## Collection

- Model: `Comment`

## Fields

- `contentType: "post" | "story"` (required)
- `contentId: string` (required)
- `author: { clerkId, username, email, profileImage? }` (required; snapshot)
- `text: string` (required, max 2000)
- `reactionsCount: number` (default `0`)
- `likesCount: number` (default `0`)
- `createdAt`, `updatedAt` via timestamps

## Indexes

- `contentType: 1, contentId: 1, createdAt: -1`
- `author.clerkId: 1, createdAt: -1`
- `contentId: 1, createdAt: -1`

## Invariants / notes

- `author` is denormalized; profile snapshot propagation applies.
- `likesCount` is a cached counter for `CommentLike`.
- `reactionsCount` is a cached counter for `Reaction` where `contentType === "comment"`.
