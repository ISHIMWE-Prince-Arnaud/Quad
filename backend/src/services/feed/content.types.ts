import type { IPost } from "../../types/post.types.js";
import type { IPoll } from "../../types/poll.types.js";

export type ContentItem = IPost | IPoll;

export type ContentType = "post" | "poll";
