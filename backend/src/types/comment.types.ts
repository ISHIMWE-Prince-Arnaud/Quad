// Valid content types that can receive comments
export type CommentableContentType = "post" | "story";

export interface IComment {
  _id: string;
  contentType: CommentableContentType; // Type of content being commented on
  contentId: string;                   // ID of the content (post, story, poll, etc.)
  author: {
    clerkId: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  text: string;           // Comment content
  reactionsCount: number; // Number of reactions on this comment (like, love, etc.)
  likesCount: number;     // Number of likes on this comment (from CommentLike model)
  createdAt: Date;
  updatedAt: Date;
}

// For comment likes (separate from content reactions)
export interface ICommentLike {
  _id: string;
  commentId: string;
  userId: string;
  username: string;
  createdAt: Date;
}

// Interface for content that can be commented on
export interface ICommentable {
  _id: string;
  commentsCount?: number;
  // Add any common properties here
}
