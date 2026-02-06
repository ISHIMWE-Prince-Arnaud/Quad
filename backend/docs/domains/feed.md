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

## Get feed: `GET /api/feed`

- Defaults to the **For You** flow (`getForYouFeed`).

## Following feed: `GET /api/feed/following`

### Controller

- Reads `userId`.
- Reads validated query (`tab`, `cursor`, `limit`, `sort`).
- Calls `FeedService.getFollowingFeed(userId, query)`.

### Service flow

- Uses `getUserFollowing(userId)` to build followed ids.
- If none followed -> returns `emptyResponse`.
- Builds `baseQuery` optionally using cursor (`_id < cursor`).
- Fetches content from sources:
  - `tab=home`: mixed posts + polls with configured ratios.
  - `tab=posts`: post source only.
  - `tab=polls`: poll source only.

### Ranking + diversity

- Calls `scoreAndRankContent(items, userId, sort)`.
- For `home` tab:
  - `applyContentTypeDiversity`
  - `applyAuthorDiversity`

### Pagination

- Response returns:
  - `items` sliced to `limit`
  - `pagination.nextCursor` as last item `_id`
  - `hasMore` based on scored length

## For you feed: `GET /api/feed/foryou`

Key difference:

- Mixes following + discovery items per content type:
  - `FOLLOWING_RATIO`
  - `DISCOVERY_RATIO`

Implementation:

- helper `fetchMixedForSource(...)` splits queries using `$in` vs `$nin` for followed ids.

## New content count: `GET /api/feed/new-count`

Inputs:

- `feedType`: `following | foryou`
- `tab`: `home | posts | polls`
- `since`: content id

Flow:

- Builds `baseQuery: { _id: { $gt: since } }`.
- Uses source `count(q)` methods.
- If `feedType=following` restricts author field to followed ids.

## Related docs

- Realtime spec for feed events: `backend/docs/REALTIME_SPEC.md`
