// Valid content types that can receive reactions
export type ReactableContentType = "post" | "story" | "poll" | "comment";

export interface IReaction {
  _id: string;
  contentType: ReactableContentType;  // Type of content being reacted to
  contentId: string;                  // ID of the content (post, story, poll, etc.)
  userId: string;                     // Clerk user ID
  username: string;                   // User's display name (snapshot)
  profileImage?: string;              // User's avatar (snapshot)
  type: "love"; // Reaction types
  createdAt: Date;
  updatedAt: Date;
}

export type ReactionType = IReaction["type"];

// For aggregated reaction counts
export interface IReactionCount {
  type: ReactionType;
  count: number;
}

// Interface for content that can be reacted to
export interface IReactable {
  _id: string;
  // Add any common properties here
}
