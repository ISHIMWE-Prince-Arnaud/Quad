import type { IPost } from "../../types/post.types.js";
import type { IPoll } from "../../types/poll.types.js";
import type { IStory } from "../../types/story.types.js";

export type ContentItem = IPost | IPoll | IStory;

export type ContentType = "post" | "poll" | "story";
