export interface CommentAuthor {
  clerkId: string;
  username: string;
  email: string;
  profileImage?: string;
}

export interface Comment {
  _id: string;
  contentType: "post" | "story" | "poll";
  contentId: string;
  author: CommentAuthor;
  text: string;
  parentId?: string;
  reactionsCount: number;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}
