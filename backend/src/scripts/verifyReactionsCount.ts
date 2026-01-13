import mongoose from "mongoose";

import { connectDB } from "../config/db.config.js";
import { Comment } from "../models/Comment.model.js";
import { Poll } from "../models/Poll.model.js";
import { Post } from "../models/Post.model.js";
import { Reaction } from "../models/Reaction.model.js";
import { Story } from "../models/Story.model.js";
import type { ReactableContentType } from "../types/reaction.types.js";
import { logger } from "../utils/logger.util.js";

type ReactionGroup = {
  _id: { contentType: ReactableContentType; contentId: string };
  count: number;
};

type ContentModel = {
  find: (
    filter: mongoose.FilterQuery<unknown>
  ) => {
    select: (
      fields: string
    ) => {
      lean: () => Promise<Array<{ _id: unknown; reactionsCount?: unknown }>>;
    };
  };
  countDocuments: (filter: mongoose.FilterQuery<unknown>) => Promise<number>;
};

const args = process.argv.slice(2);
const argSet = new Set(args);

const getArgValue = (name: string): string | undefined => {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  const next = args[idx + 1];
  if (!next || next.startsWith("--")) return undefined;
  return next;
};

const contentTypeFilter = getArgValue("--contentType") as
  | ReactableContentType
  | undefined;

const limitRaw = getArgValue("--limit");
const LIMIT = limitRaw ? Number(limitRaw) : undefined;

const MAX_EXAMPLES = 25;

const getModel = (contentType: ReactableContentType): ContentModel => {
  switch (contentType) {
    case "post":
      return Post as unknown as ContentModel;
    case "story":
      return Story as unknown as ContentModel;
    case "poll":
      return Poll as unknown as ContentModel;
    case "comment":
      return Comment as unknown as ContentModel;
  }
};

const verifyType = async (
  contentType: ReactableContentType,
  groups: Map<string, number>
): Promise<{
  mismatches: number;
  staleNonZero: number;
  examples: Array<{ contentId: string; cached: number; actual: number }>;
}> => {
  const model = getModel(contentType);
  const ids = Array.from(groups.keys());

  const limitedIds = typeof LIMIT === "number" ? ids.slice(0, LIMIT) : ids;

  const docs =
    limitedIds.length > 0
      ? await model
          .find({ _id: { $in: limitedIds } })
          .select("reactionsCount")
          .lean()
      : [];

  const cachedMap = new Map<string, number>();
  for (const d of docs) {
    cachedMap.set(String(d._id), typeof d.reactionsCount === "number" ? d.reactionsCount : 0);
  }

  let mismatches = 0;
  const examples: Array<{ contentId: string; cached: number; actual: number }> = [];

  for (const contentId of limitedIds) {
    const actual = groups.get(contentId) ?? 0;
    const cached = cachedMap.get(contentId) ?? 0;

    if (cached !== actual) {
      mismatches++;
      if (examples.length < MAX_EXAMPLES) {
        examples.push({ contentId, cached, actual });
      }
    }
  }

  const staleFilter = ids.length
    ? { reactionsCount: { $gt: 0 }, _id: { $nin: ids } }
    : { reactionsCount: { $gt: 0 } };

  const staleNonZero = await model.countDocuments(staleFilter);

  return { mismatches, staleNonZero, examples };
};

async function main(): Promise<void> {
  if (argSet.has("--help")) {
    logger.info(
      "Usage: npm --prefix backend run verify:reactions [--contentType post|story|poll|comment] [--limit N]"
    );
    return;
  }

  logger.server("Starting reactionsCount verification...");
  if (contentTypeFilter) {
    logger.info(`Filtering to contentType=${contentTypeFilter}`);
  }

  await connectDB();

  const groups = await Reaction.aggregate<ReactionGroup>([
    {
      $group: {
        _id: { contentType: "$contentType", contentId: "$contentId" },
        count: { $sum: 1 },
      },
    },
  ]);

  const byType: Record<ReactableContentType, Map<string, number>> = {
    post: new Map(),
    story: new Map(),
    poll: new Map(),
    comment: new Map(),
  };

  for (const g of groups) {
    byType[g._id.contentType].set(g._id.contentId, g.count);
  }

  const types: ReactableContentType[] = contentTypeFilter
    ? [contentTypeFilter]
    : ["post", "story", "poll", "comment"];

  let totalMismatches = 0;
  let totalStaleNonZero = 0;

  for (const t of types) {
    const result = await verifyType(t, byType[t]);
    totalMismatches += result.mismatches;
    totalStaleNonZero += result.staleNonZero;

    logger.info(`Verification summary for ${t}`, {
      reactionGroups: byType[t].size,
      mismatches: result.mismatches,
      staleNonZero: result.staleNonZero,
    });

    if (result.examples.length > 0) {
      logger.warn(`Mismatch examples for ${t}`, result.examples);
    }
  }

  if (totalMismatches === 0 && totalStaleNonZero === 0) {
    logger.success("reactionsCount verification passed");
    return;
  }

  logger.error("reactionsCount verification failed", {
    totalMismatches,
    totalStaleNonZero,
  });
  process.exitCode = 1;
}

await main()
  .catch((error) => {
    logger.error("reactionsCount verification crashed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
