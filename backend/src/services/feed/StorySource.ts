import type { FeedSource } from "./FeedSource.interface.js";
import type { IRawContentItem } from "../../types/feed.types.js";

export class StorySource implements FeedSource {
  async fetch(
    query: Record<string, unknown>,
    limit: number,
  ): Promise<IRawContentItem[]> {
    void query;
    void limit;
    return [];
  }

  async count(query: Record<string, unknown>): Promise<number> {
    void query;
    return 0;
  }
}
