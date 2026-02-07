# Feed (Internal Flow)

## Entry points

- Route: `backend/src/routes/feed.routes.ts`
- Controller: `backend/src/controllers/feed.controller.ts`
- Service: `backend/src/services/feed.service.ts`
- Feed sources:
  - `backend/src/services/feed/PostSource.js`
  - `backend/src/services/feed/PollSource.js`
- Config:
  - `backend/src/config/feed.config.ts`
- Utils:
  - `backend/src/utils/feed.util.ts`

## Middleware chain

- `requireApiAuth`
- `validateSchema(feedQuerySchema | newCountQuerySchema, "query")`

## Request/response contracts

All feed endpoints return `{ success: true, data: ... }`.

Feed response shape (`IFeedResponse` as returned by `FeedService`):

- `items`: array of feed items
  - Each item includes:
    - `type`: `post | poll`
    - `content`: the underlying Post or Poll content
    - `score`: number (computed by ranking)
    - `priority`: `following | discover`
    - `createdAt`
    - `authorId`
    - `engagementMetrics`: `{ reactions, comments?, votes }`
    - `author`: `{ clerkId, username, profileImage? }`
- `pagination`:
  - `nextCursor?`: string
  - `hasMore`: boolean
  - `count`: number
- `metadata`:
  - `feedType`: `following | foryou`
  - `tab`: `home | posts | polls`
  - `sort`: `newest | trending`

## Get feed: `GET /api/feed`

- Defaults to the **For You** flow (`getForYouFeed`).

Request contract (validated by `feedQuerySchema`):

- Query:
  - `tab`: `home | posts | polls` (default `home`)
  - `cursor?`: string (opaque; used as Mongo `_id` cursor in sources)
  - `limit`: string -> number (default 20, must be 1-50)
  - `sort`: `newest | trending` (default `newest`)

## Following feed: `GET /api/feed/following`

### Controller

- Reads `userId`.
- Reads validated query (`tab`, `cursor`, `limit`, `sort`).
- Calls `FeedService.getFollowingFeed(userId, query)`.

### Response contract

- `200`:
  - `{ success: true, data: IFeedResponse }`

### Service flow

- Uses `getUserFollowing(userId)` to build followed ids.
- If none followed -> returns `emptyResponse`.
- Builds `baseQuery` optionally using cursor (`_id < cursor`).
- Fetches content from sources:
  - `tab=home`: mixed posts + polls with configured ratios.
  - `tab=posts`: post source only.
  - `tab=polls`: poll source only.

Edge cases:

- If the user follows nobody, the response is an empty feed with `hasMore: false`.
- `cursor` is passed through as `_id < cursor`; callers must treat it as an opaque string.

### Ranking + diversity

- Calls `scoreAndRankContent(items, userId, sort)`.
- For `home` tab:
  - `applyContentTypeDiversity`
  - `applyAuthorDiversity`

Ranking semantics:

- `sort=newest`:
  - uses a recency score with a following boost.
- `sort=trending`:
  - combines:
    - recency
    - engagement (reactions + comments, plus votes-weighting for polls)
    - following boost
    - author popularity (followersCount)

### Pagination

- Response returns:
  - `items` sliced to `limit`
  - `pagination.nextCursor` as last item `_id`
  - `hasMore` based on scored length

Notes:

- `hasMore` is computed from the pre-sliced candidate list (`scoredItems.length > limit`).
- `nextCursor` is the `_id` of the last returned item.

## For you feed: `GET /api/feed/foryou`

Key difference:

- Mixes following + discovery items per content type:
  - `FOLLOWING_RATIO`
  - `DISCOVERY_RATIO`

Implementation:

- helper `fetchMixedForSource(...)` splits queries using `$in` vs `$nin` for followed ids.

Edge cases:

- If the user follows nobody, all content becomes discovery and is fetched without `$in/$nin` splits.

## New content count: `GET /api/feed/new-count`

Inputs:

- `feedType`: `following | foryou`
- `tab`: `home | posts | polls`
- `since`: content id

Request contract (validated by `newCountQuerySchema`):

- Query:
  - `feedType`: `following | foryou`
  - `tab?`: `home | posts | polls` (default `home`)
  - `since`: non-empty string

Flow:

- Builds `baseQuery: { _id: { $gt: since } }`.
- Uses source `count(q)` methods.
- If `feedType=following` restricts author field to followed ids.

Response contract:

- `200`:
  - `{ success: true, data: { count: number } }`

Edge cases:

- If `feedType=following` and the user follows nobody, returns `{ count: 0 }` early.

## Failure modes

- `401 Unauthorized`: missing auth.
- `400 Validation error`:
  - `limit` outside 1-50
  - invalid `tab`/`sort`/`feedType`
  - missing `since` for new-count

## Related docs

- Realtime spec for feed events: `backend/docs/REALTIME_SPEC.md`
