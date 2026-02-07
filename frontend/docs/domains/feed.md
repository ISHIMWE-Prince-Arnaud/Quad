# Feed (Frontend Internal Flow)

## Entry points

- Page: `frontend/src/pages/app/FeedPage.tsx`
- Controller hook: `frontend/src/pages/app/feed/useFeedController.ts`
- Service(s):
  - `frontend/src/services/feedService.ts`
  - `frontend/src/services/postService.ts`
  - `frontend/src/services/pollService.ts`
- Realtime client:
  - `frontend/src/lib/socket.ts`

## Data flow overview

- `FeedPage` owns the view state for:
  - `feedType` (`following` | `foryou`)
  - `tab` (feed sub-tab)
- `useFeedController` owns:
  - initial fetch via `FeedService.getFeed(...)`
  - pagination via `cursor`
  - refresh via `handleRefreshFeed()`
  - optimistic removals after `PostService.deletePost(...)` / `PollService.deletePoll(...)`

## REST integration

- Initial load:
  - `FeedService.getFeed(feedType, { tab, limit, sort })`
- New count polling:
  - `FeedService.getNewContentCount({ feedType, tab, since: lastSeenId })` (interval)

## Realtime integration

Listeners are registered in `useFeedController`:

- `feed:new-content`
  - Behavior: refresh immediately if near top; otherwise increments `newCount`.
- `feed:engagement-update`
  - Behavior:
    - For posts: updates `reactionsCount` and `commentsCount` in the cached feed item.
    - For polls: updates vote count in `engagementMetrics` when `votes` is present.
- `feed:content-deleted`
  - Behavior: removes the deleted item from the in-memory feed list.

## Reconciliation rules

- Feed events are best-effort hints; the authoritative state still comes from REST.
- The controller is defensive:
  - keeps pagination cursor from REST responses
  - dedupes items on merge
  - refreshes instead of trying to hydrate unknown content from realtime payloads
