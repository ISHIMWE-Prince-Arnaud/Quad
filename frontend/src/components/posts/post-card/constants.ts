import type { ReactionType } from "@/services/reactionService";

export const MAX_PREVIEW_LENGTH = 280;

export const reactionEmojiMap: Record<ReactionType, string> = {
  love: "❤️",
};

export const EMPTY_REACTION_COUNTS: Readonly<Record<ReactionType, number>> = {
  love: 0,
};
