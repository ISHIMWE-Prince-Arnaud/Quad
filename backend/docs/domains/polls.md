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

## Create poll: `POST /api/polls`

### Controller (`createPoll`)

- Reads `userId`.
- Calls `PollService.createPoll(userId, pollData)`.

### Service (`createPoll`)

- Loads author `User`.
- Creates Poll with:
  - embedded author snapshot
  - options initialized with `votesCount: 0`
  - `totalVotes: 0`, `reactionsCount: 0`

### Side effects

- `io.emit("newPoll", poll)` (legacy)
- `emitNewContent(io, "poll", pollId, authorId)` → `feed:new-content`

## Get polls: `GET /api/polls`

### Controller

- Uses validated query (already parsed by middleware).
- Calls `PollService.getAllPolls(userId, query)`.

### Service

- Builds a Mongo filter:
  - status
  - author
  - voted (requires userId; uses PollVote lookup)
- Fetches paginated polls + total.
- Loads user vote docs for returned polls (if userId) and formats response:
  - `formatPollResponse(poll, userVote, showResults)`
  - `canViewResults(poll, hasVoted)`

## Get poll by id: `GET /api/polls/:id`

- Loads poll.
- Loads user vote.
- Formats response with showResults computed.

## Update poll: `PUT /api/polls/:id`

Key invariants enforced in service:

- Only author may update.
- Poll cannot be edited after votes exist.
- Poll cannot be edited if expired.
- Question media must be an image.

Side effects:

- Emits `pollUpdated` (legacy) with formatted poll.

## Delete poll: `DELETE /api/polls/:id`

- Only author may delete.
- Deletes Poll and related PollVote docs.

Side effects:

- Emits `pollDeleted` (legacy)
- Emits `feed:content-deleted`

## Vote on poll: `POST /api/polls/:id/vote`

Service behavior:

- Ensures poll exists and is accepting votes.
- Validates vote indices with `validateVoteIndices`.
- Prevents double voting.
- Creates `PollVote`.
- Updates `votesCount` and `totalVotes`.

Side effects:

- May create a `poll_milestone` notification when totalVotes crosses thresholds.
- Emits `pollVoted` (legacy) with counts.
- Emits `feed:engagement-update` including votes.

## Remove vote: `DELETE /api/polls/:id/vote`

- Only poll author can remove votes.
- Deletes a vote and decrements counts.
- Emits `feed:engagement-update`.

## Related docs

- Realtime spec: `backend/docs/REALTIME_SPEC.md`
- API reference: `backend/docs/api/polls.md`
