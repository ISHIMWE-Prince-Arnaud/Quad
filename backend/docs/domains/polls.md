# Polls (Internal Flow)

## Entry points

- Route: `backend/src/routes/poll.routes.ts`
- Controller: `backend/src/controllers/poll.controller.ts`
- Service: `backend/src/services/poll.service.ts`
- Models:
  - `backend/src/models/Poll.model.ts`
  - `backend/src/models/PollVote.model.ts`
- Schema: `backend/src/schemas/poll.schema.ts`

## Middleware chain

- Mounted under `/api/polls` with `writeRateLimiter` in `backend/src/routes/index.ts`.
- Route-level:
  - `requireApiAuth`
  - `validateSchema` for params/query/body.

## Data model + invariants

Models:

- `backend/src/models/Poll.model.ts`
- `backend/src/models/PollVote.model.ts`

Key invariants:

- `author` is an embedded user snapshot (`author.clerkId` is the authoritative owner id).
- `question` length: 10-500 characters.
- `options`: 2-5 items, each 1-200 characters, case-insensitive uniqueness enforced:
  - Zod `refine(...)` in `poll.schema.ts`
  - Mongoose `pre("save")` validation in `Poll.model.ts`
- `status`: `active | expired` (legacy values like `closed` are coerced to `expired` in a `pre("validate")` hook).
- Vote totals are cached on the poll:
  - per-option `votesCount`
  - `totalVotes`
- `reactionsCount` is a cached counter maintained via the Reactions domain.

## Create poll: `POST /api/polls`

### Controller (`createPoll`)

- Reads `userId`.
- Calls `PollService.createPoll(userId, pollData)`.

### Request contract (validated by `createPollSchema`)

- Body (JSON):
  - `question`: string (10-500)
  - `questionMedia?`: `{ url, type: "image", aspectRatio? } | null`
  - `options`: array (2-5)
    - `text`: string (1-200)
  - `settings?`: `{ anonymousVoting?: boolean }` (defaults to `{ anonymousVoting: false }`)
  - `expiresAt?`: datetime string or Date; must be in the future

### Response contract

- `201`:
  - `{ success: true, data: PollDocument }`
  - The create flow returns the created Mongoose document (not `formatPollResponse`).

### Service (`createPoll`)

- Loads author `User`.
- Creates Poll with:
  - embedded author snapshot
  - options initialized with `votesCount: 0`
  - `totalVotes: 0`, `reactionsCount: 0`

### Side effects

- `io.emit("newPoll", poll)` (legacy)
- `emitNewContent(io, "poll", pollId, authorId)` → `feed:new-content`

### Failure modes

- `401 Unauthorized`: missing auth.
- `404 User not found`: user record not created yet.
- `400 Validation error`:
  - question length
  - options length / duplicate option text
  - `expiresAt` not in the future
  - `questionMedia.type` must be `image`.

## Get polls: `GET /api/polls`

### Controller

- Uses validated query (already parsed by middleware).
- Calls `PollService.getAllPolls(userId, query)`.

### Request contract (validated by `getPollsQuerySchema`)

- Query:
  - `page`: string -> number, default 1, must be > 0
  - `limit`: string -> number, default 10, must be 1-50
  - `status`: `active | expired | all` (default `all`)
  - `author?`: clerk id (filters by `author.clerkId`)
  - `voted?`: `"true" | "false"` -> boolean (only applied when `userId` is present)

### Response contract

- `200`:
  - `{ success: true, data: FormattedPoll[], pagination }`
  - Each poll is produced by `formatPollResponse(...)` and includes:
    - `options` either with vote counts (when results visible) or without
    - `userVote?`
    - `canViewResults`

### Service

- Builds a Mongo filter:
  - status
  - author
  - voted (requires userId; uses PollVote lookup)
- Fetches paginated polls + total.
- Loads user vote docs for returned polls (if userId) and formats response:
  - `formatPollResponse(poll, userVote, showResults)`
  - `canViewResults(poll, hasVoted)`

Notes on result visibility:

- `canViewResults(...)` currently returns `true` only when the caller has voted.
- `formatPollResponse(...)` normalizes the status (`closed` -> `expired`) and adds `canViewResults`.

## Get poll by id: `GET /api/polls/:id`

- Loads poll.
- Loads user vote.
- Formats response with showResults computed.

Request contract:

- Params:
  - `id`: must match a 24-hex Mongo id (`pollIdSchema`).

## Update poll: `PUT /api/polls/:id`

Key invariants enforced in service:

- Only author may update.
- Poll cannot be edited after votes exist.
- Poll cannot be edited if expired.
- Question media must be an image.

Request contract (validated by `updatePollSchema`):

- Body:
  - `question?`
  - `questionMedia?`: `{ url, type: "image", aspectRatio? } | null`
  - `options?`: 2-5 options (same uniqueness rules)
  - `settings?`: `{ anonymousVoting?: boolean }`
  - `expiresAt?`: datetime | Date | null

Response contract:

- `200`:
  - `{ success: true, data: FormattedPoll }`
  - Update returns `formatPollResponse(...)`, not the raw document.

Side effects:

- Emits `pollUpdated` (legacy) with formatted poll.

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Only the author can update this poll`.
- `400 Cannot edit a poll after votes have been cast`.
- `400 Cannot edit an expired poll`.
- `400 Poll questionMedia must be an image`.

## Delete poll: `DELETE /api/polls/:id`

- Only author may delete.
- Deletes Poll and related PollVote docs.

Side effects:

- Emits `pollDeleted` (legacy)
- Emits `feed:content-deleted`

Failure modes:

- `401 Unauthorized`: missing auth.
- `403 Only the author can delete this poll`.
- `404 Poll not found`.

## Vote on poll: `POST /api/polls/:id/vote`

Service behavior:

- Ensures poll exists and is accepting votes.
- Validates vote indices with `validateVoteIndices`.
- Prevents double voting.
- Creates `PollVote`.
- Updates `votesCount` and `totalVotes`.

Request contract (validated by `voteOnPollSchema`):

- Body:
  - `optionIndices`: array of non-negative ints, must be length 1

Side effects:

- May create a `poll_milestone` notification when `totalVotes` crosses thresholds: `10, 50, 100, 250, 500, 1000, 5000, 10000`.
- Emits `pollVoted` (legacy) with counts.
- Emits `feed:engagement-update` including votes.

Failure modes:

- `401 Unauthorized`: missing auth.
- `404 Poll not found`.
- `400 This poll is not accepting votes` (inactive/expired).
- `400 Must select exactly one option` or out-of-range indices.
- `400 You have already voted on this poll`.

## Related docs

- Realtime spec: `backend/docs/REALTIME_SPEC.md`
- API reference: `backend/docs/api/polls.md`
