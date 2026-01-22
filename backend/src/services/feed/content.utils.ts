import type { IPost } from "../../types/post.types.js";
import type { IPoll } from "../../types/poll.types.js";
import type { IStory } from "../../types/story.types.js";
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

export const isStory = (item: unknown): item is IStory => {
  return (
    typeof item === "object" &&
    item !== null &&
    "title" in item &&
    "status" in item &&
    !("question" in item)
  );
};

export const isPost = (item: unknown): item is IPost => {
  return (
    typeof item === "object" &&
    item !== null &&
    !isPoll(item) &&
    !isStory(item) &&
    ("media" in item || "text" in item)
  );
};

export const getContentAuthorId = (content: ContentItem | unknown): string => {
  if (!content) return "";

  if (isPost(content)) {
    // Post model has top-level userId
    if ("userId" in content && typeof (content as any).userId === "string") {
      return (content as any).userId;
    }
    // Fallback to author object if userId missing (unlikely in DB)
    return content.author?.clerkId || "";
  }

  if (isStory(content)) {
    // Story model has top-level userId
    if ("userId" in content && typeof (content as any).userId === "string") {
      return (content as any).userId;
    }
    return content.author?.clerkId || "";
  }

  if (isPoll(content)) {
    // Poll model only has author object
    return content.author?.clerkId || "";
  }

  return "";
};
