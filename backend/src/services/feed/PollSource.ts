import { Poll } from "../../models/Poll.model.js";
import type { FeedSource } from "./FeedSource.interface.js";
import type { IRawContentItem } from "../../types/feed.types.js";
import { getContentAuthorId } from "./content.utils.js";
import { formatPollResponse } from "../../utils/poll.util.js";

export class PollSource implements FeedSource {
  async fetch(
    query: Record<string, unknown>,
    limit: number,
  ): Promise<IRawContentItem[]> {
    const polls = await Poll.find(query).sort({ createdAt: -1 }).limit(limit);
    return polls.map((poll) => ({
      _id: poll._id,
      type: "poll" as const,
      content: formatPollResponse(poll, undefined, false),
      createdAt: poll.createdAt,
      authorId: getContentAuthorId(poll),
      reactionsCount: poll.reactionsCount || 0,
      totalVotes: poll.totalVotes || 0,
    }));
  }

  async count(query: Record<string, unknown>): Promise<number> {
    return Poll.countDocuments(query);
  }
}
