# Poll (`Poll.model.ts`)

## Collection

- Model: `Poll`

## Fields

- `author: object` (required; embedded user snapshot)
- `question: string` (required, trimmed, min 10, max 500)
- `questionMedia?: { url?, type?, aspectRatio? }`
  - `type` enum: `image`
  - custom validator ensures: if present => includes `url` and `type === "image"`
- `options: { text, votesCount }[]`
  - size validated to be 2..5
  - `text` min 1 max 200
  - `votesCount` default 0, min 0
- `settings.anonymousVoting: boolean` (default `false`)
- `status: "active" | "expired"` (default `active`)
- `expiresAt?: Date`
- `totalVotes: number` (default `0`, min `0`)
- `reactionsCount: number` (default `0`, min `0`)
- `createdAt`, `updatedAt` via timestamps

## Indexes

- `status: 1, createdAt: -1`
- `author.clerkId: 1, createdAt: -1`
- `status: 1, expiresAt: 1`
- `totalVotes: -1, createdAt: -1`
- `status: 1, createdAt: -1, totalVotes: -1, reactionsCount: -1`

## Invariants / notes

- Pre-save hook coerces legacy `status === "closed"` to `"expired"`.
- Pre-save hook enforces option text uniqueness (case-insensitive, trimmed).
- Votes are recorded in `PollVote` (one vote per user per poll).
