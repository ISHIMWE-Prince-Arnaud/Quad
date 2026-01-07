import type { FeedItem } from "@/types/feed";
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
