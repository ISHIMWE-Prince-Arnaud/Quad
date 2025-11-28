export interface Post {
  _id: string;
  userId: string;
  author: {
    clerkId: string;
    username: string;
    email: string;
    profileImage?: string;
  };
  text?: string;
  media?: Array<{
    url: string;
    type: "image" | "video";
    aspectRatio?: "1:1" | "16:9" | "9:16";
  }>;
  reactionsCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}
