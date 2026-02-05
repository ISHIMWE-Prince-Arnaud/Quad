import type { FeedItem } from "@/types/feed";
import type { FeedTab } from "@/types/feed";
import type { Post } from "@/types/post";

export function getFeedItemKey(item: FeedItem): string {
  if (item.type === "post") {
    const content = item.content as Post;
    return `post:${content._id}`;
  }

  return `${item.type}:${String(item._id)}`;
}

export function dedupeFeedItems(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getFeedItemKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const FEED_MIX_PATTERN: Array<"post" | "poll"> = [
  "post",
  "post",
  "post",
  "post",
  "post",
  "post",
  "post",
  "poll",
  "poll",
  "poll",
];

export function filterFeedItemsForTab(
  items: FeedItem[],
  tab: FeedTab,
): FeedItem[] {
  if (tab === "posts") {
    return items.filter((item) => item.type === "post");
  }

  if (tab === "polls") {
    return items.filter((item) => item.type === "poll");
  }

  return items;
}

export function mixPostsAndPolls(
  items: FeedItem[],
  startPatternIndex: number,
): { items: FeedItem[]; nextPatternIndex: number } {
  const posts: FeedItem[] = [];
  const polls: FeedItem[] = [];

  for (const item of items) {
    if (item.type === "post") posts.push(item);
    else if (item.type === "poll") polls.push(item);
  }

  const mixed: FeedItem[] = [];
  let patternIndex = startPatternIndex;
  let postIndex = 0;
  let pollIndex = 0;

  while (postIndex < posts.length || pollIndex < polls.length) {
    const desired = FEED_MIX_PATTERN[patternIndex % FEED_MIX_PATTERN.length];

    let next: FeedItem | undefined;
    if (desired === "post") {
      next = posts[postIndex] ?? polls[pollIndex];
      if (posts[postIndex]) postIndex += 1;
      else if (polls[pollIndex]) pollIndex += 1;
    } else {
      next = polls[pollIndex] ?? posts[postIndex];
      if (polls[pollIndex]) pollIndex += 1;
      else if (posts[postIndex]) postIndex += 1;
    }

    if (!next) break;
    mixed.push(next);
    patternIndex += 1;
  }

  return {
    items: mixed,
    nextPatternIndex: patternIndex % FEED_MIX_PATTERN.length,
  };
}
