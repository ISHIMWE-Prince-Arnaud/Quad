import type { IPost } from "../../types/post.types.js";
import type { IPoll } from "../../types/poll.types.js";
import type { ContentItem } from "./content.types.js";

// Type Guards
export const isPoll = (item: unknown): item is IPoll => {
  return (
    typeof item === "object" &&
    item !== null &&
    "question" in item &&
    "options" in item
  );
};

export const isPost = (item: unknown): item is IPost => {
  return (
    typeof item === "object" &&
    item !== null &&
    !isPoll(item) &&
    ("media" in item || "text" in item)
  );
};

export const getContentAuthorId = (content: ContentItem | unknown): string => {
  if (!content) return "";

  if (isPost(content)) {
    // Post model has top-level userId
    const userId = (content as unknown as { userId?: unknown }).userId;
    if (typeof userId === "string") {
      return userId;
    }
    // Fallback to author object if userId missing (unlikely in DB)
    return content.author?.clerkId || "";
  }

  if (isPoll(content)) {
    // Poll model only has author object
    return content.author?.clerkId || "";
  }

  return "";
};
