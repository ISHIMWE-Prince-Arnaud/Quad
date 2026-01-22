import { Story } from "../../models/Story.model.js";
import type { FeedSource } from "./FeedSource.interface.js";
import type { IRawContentItem } from "../../types/feed.types.js";
import { getContentAuthorId } from "./content.utils.js";

export class StorySource implements FeedSource {
  async fetch(
    query: Record<string, unknown>,
    limit: number
  ): Promise<IRawContentItem[]> {
    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return stories.map((story) => ({
      _id: story._id,
      type: "story" as const,
      content: story,
      createdAt: story.createdAt || new Date(),
      authorId: getContentAuthorId(story),
      reactionsCount: story.reactionsCount || 0,
      commentsCount: story.commentsCount || 0,
    }));
  }

  async count(query: Record<string, unknown>): Promise<number> {
    return Story.countDocuments(query);
  }
}
