import mongoose from "mongoose";

import { connectDB } from "../config/db.config.js";
import { User } from "../models/User.model.js";
import { findUserByUsernameOrAlias } from "../utils/userLookup.util.js";
import { extractMentions } from "../utils/chat.util.js";
import { logger } from "../utils/logger.util.js";

type Args = {
  clerkId?: string;
  username?: string;
  mentionText?: string;
};

const argv = process.argv.slice(2);

const getArg = (key: string): string | undefined => {
  const idx = argv.indexOf(key);
  if (idx === -1) return undefined;
  const next = argv[idx + 1];
  if (!next || next.startsWith("--")) return undefined;
  return next;
};

const args: Args = {
};

const clerkIdArg = getArg("--clerkId");
if (clerkIdArg) {
  args.clerkId = clerkIdArg;
}

const usernameArg = getArg("--username");
if (usernameArg) {
  args.username = usernameArg;
}

const mentionTextArg = getArg("--mentionText");
if (mentionTextArg) {
  args.mentionText = mentionTextArg;
}

async function main(): Promise<void> {
  if (argv.includes("--help")) {
    logger.info(
      "Usage: npm --prefix backend run verify:aliases -- [--clerkId <clerkId>] [--username <usernameOrAlias>] [--mentionText \"hello @oldname\"]"
    );
    return;
  }

  await connectDB();

  // Pick a target user
  let user = null;
  if (args.clerkId) {
    user = await User.findOne({ clerkId: args.clerkId });
  } else if (args.username) {
    user = await findUserByUsernameOrAlias(args.username);
  } else {
    user = await User.findOne({ previousUsernames: { $exists: true, $ne: [] } });
  }

  if (!user) {
    logger.error(
      "No user found to verify aliases. Provide --clerkId/--username or ensure at least one user has previousUsernames.",
      {}
    );
    process.exitCode = 1;
    return;
  }

  const previousRaw = (user as unknown as { previousUsernames?: unknown }).previousUsernames;
  const previous = Array.isArray(previousRaw)
    ? previousRaw.filter((v): v is string => typeof v === "string")
    : [];

  logger.info("Selected user for alias verification", {
    clerkId: user.clerkId,
    username: user.username,
    previousUsernames: previous,
  });

  // Verify current username resolves
  const foundByCurrent = await findUserByUsernameOrAlias(user.username);
  if (!foundByCurrent || foundByCurrent.clerkId !== user.clerkId) {
    logger.error("Lookup by current username failed", {
      expectedClerkId: user.clerkId,
      username: user.username,
      found: foundByCurrent ? foundByCurrent.clerkId : null,
    });
    process.exitCode = 1;
  }

  // Verify each alias resolves
  for (const alias of previous) {
    const foundByAlias = await findUserByUsernameOrAlias(alias);
    if (!foundByAlias || foundByAlias.clerkId !== user.clerkId) {
      logger.error("Lookup by alias failed", {
        expectedClerkId: user.clerkId,
        alias,
        found: foundByAlias ? foundByAlias.clerkId : null,
      });
      process.exitCode = 1;
    }
  }

  // Optional: verify mention extraction + lookup
  const mentionText =
    args.mentionText ??
    (previous[0]
      ? `hello @${previous[0]} and @${user.username}`
      : `hello @${user.username}`);

  const mentions = extractMentions(mentionText);
  logger.info("Extracted mentions", { mentionText, mentions });

  for (const mention of mentions) {
    const resolved = await findUserByUsernameOrAlias(mention);
    logger.info("Resolved mention", {
      mention,
      resolvedClerkId: resolved?.clerkId ?? null,
      resolvedUsername: resolved?.username ?? null,
    });

    if (resolved && resolved.clerkId !== user.clerkId) {
      logger.warn("Mention resolved to a different user than the selected one", {
        mention,
        selectedClerkId: user.clerkId,
        resolvedClerkId: resolved.clerkId,
      });
    }
  }

  if (!process.exitCode) {
    logger.success("Alias verification passed");
  }
}

await main()
  .catch((error) => {
    logger.error("Alias verification crashed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
