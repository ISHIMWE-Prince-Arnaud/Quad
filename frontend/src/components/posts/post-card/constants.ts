import type { ReactionType } from "@/services/reactionService";

export const MAX_PREVIEW_LENGTH = 280;

export const reactionEmojiMap: Record<ReactionType, string> = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export const EMPTY_REACTION_COUNTS: Readonly<Record<ReactionType, number>> = {
  like: 0,
  love: 0,
  laugh: 0,
  wow: 0,
  sad: 0,
  angry: 0,
};
