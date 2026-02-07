# PollVote (`PollVote.model.ts`)

## Collection

- Model: `PollVote`

## Fields

- `pollId: ObjectId` (required, ref `Poll`)
- `userId: string` (required; Clerk user ID)
- `optionIndices: number[]` (required)
  - validator enforces length 1..5
- `votedAt: Date` (default `Date.now`)

## Indexes

- Unique: `pollId: 1, userId: 1` (one vote per user per poll)
- `pollId: 1, votedAt: -1`
- `userId: 1, votedAt: -1`

## Invariants / notes

- The voter record is private by design (never exposed directly).
- `optionIndices` refers to indices in the poll's `options` array.
