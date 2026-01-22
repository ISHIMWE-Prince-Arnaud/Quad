import type { IRawContentItem } from "../../types/feed.types.js";

export interface FeedSource {
  fetch(query: Record<string, unknown>, limit: number): Promise<IRawContentItem[]>;
  count(query: Record<string, unknown>): Promise<number>;
}
