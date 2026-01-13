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

type BulkWriteModel = {
  bulkWrite: (
    ops: Array<mongoose.AnyBulkWriteOperation<unknown>>,
    options?: mongoose.BulkWriteOptions
  ) => Promise<unknown>;
  updateMany: (
    filter: mongoose.FilterQuery<unknown>,
    update: mongoose.UpdateQuery<unknown>
  ) => Promise<unknown>;
};

type UpdateManyResultLike = {
  modifiedCount?: number;
  nModified?: number;
};

const args = new Set(process.argv.slice(2));
const WRITE =
  args.has("--write") ||
  args.has("--execute") ||
  process.env.WRITE === "true" ||
  process.env.WRITE === "1";
const DRY_RUN = !WRITE;

const bulkSetCounts = async (
  model: BulkWriteModel,
  contentType: ReactableContentType,
  groups: Map<string, number>
) => {
  const ids = Array.from(groups.keys());

  if (ids.length > 0) {
    const ops = ids.map((contentId) => {
      const count = groups.get(contentId) ?? 0;
      return {
        updateOne: {
          filter: { _id: contentId },
          update: { $set: { reactionsCount: Math.max(0, count) } },
          upsert: false,
        },
      };
    });

    if (DRY_RUN) {
      logger.info(`DRY RUN: would update ${ops.length} ${contentType} docs with new reactionsCount`);
    } else {
      await model.bulkWrite(ops, { ordered: false });
      logger.info(`Updated ${ops.length} ${contentType} docs with recomputed reactionsCount`);
    }
  }

  // Also zero out any docs that have cached reactionsCount > 0 but no reactions exist.
  // This prevents stale non-zero values when reactions were deleted but counters were not updated.
  const zeroFilter = ids.length
    ? { reactionsCount: { $gt: 0 }, _id: { $nin: ids } }
    : { reactionsCount: { $gt: 0 } };

  if (DRY_RUN) {
    logger.info(`DRY RUN: would zero out ${contentType} docs matching filter`, zeroFilter);
  } else {
    const res = await model.updateMany(zeroFilter, { $set: { reactionsCount: 0 } });
    const result = res as UpdateManyResultLike;
    const modified =
      typeof result.modifiedCount === "number"
        ? result.modifiedCount
        : typeof result.nModified === "number"
          ? result.nModified
          : undefined;
    logger.info(
      `Zeroed out stale reactionsCount for ${contentType} docs: ${modified ?? "(unknown count)"}`
    );
  }
};

async function main(): Promise<void> {
  logger.server("Starting reactionsCount recount script...");
  logger.info(`Mode: ${DRY_RUN ? "DRY RUN" : "WRITE"}`);
  if (DRY_RUN) {
    logger.warn(
      "Dry-run mode: no DB writes will be performed. Use --write to apply changes."
    );
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

  logger.info("Reaction group counts computed", {
    post: byType.post.size,
    story: byType.story.size,
    poll: byType.poll.size,
    comment: byType.comment.size,
  });

  await bulkSetCounts(Post, "post", byType.post);
  await bulkSetCounts(Story, "story", byType.story);
  await bulkSetCounts(Poll, "poll", byType.poll);
  await bulkSetCounts(Comment, "comment", byType.comment);

  logger.success("reactionsCount recount complete");
}

await main()
  .catch((error) => {
    logger.error("reactionsCount recount failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
