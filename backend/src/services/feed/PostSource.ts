import { Post } from "../../models/Post.model.js";
import type { FeedSource } from "./FeedSource.interface.js";
import type { IRawContentItem } from "../../types/feed.types.js";
import { getContentAuthorId } from "./content.utils.js";

export class PostSource implements FeedSource {
  async fetch(
    query: Record<string, unknown>,
    limit: number
  ): Promise<IRawContentItem[]> {
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return posts.map((post) => ({
      _id: post._id,
      type: "post" as const,
      content: post,
      createdAt: post.createdAt || new Date(),
      authorId: getContentAuthorId(post),
      reactionsCount: post.reactionsCount || 0,
      commentsCount: post.commentsCount || 0,
    }));
  }

  async count(query: Record<string, unknown>): Promise<number> {
    return Post.countDocuments(query);
  }
}
