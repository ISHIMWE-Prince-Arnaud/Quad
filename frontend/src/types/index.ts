export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  totalPosts?: number;
  totalReactions?: number;
  badges?: string[];
  isAdmin?: boolean;
  createdAt?: string;
}

export interface Post {
  _id: string;
  userId: User;
  user: User;
  caption: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  theme: string | null;
  reactions: {
    love: number;
  };
  reactedBy: Array<{
    userId: string;
    emoji: "love";
  }>;
  comments: Comment[];
  isTopPost: boolean;
  createdAt: string;
  totalReactions?: number;
}

export interface Comment {
  _id: string;
  userId: User;
  text: string;
  createdAt: string;
}

export interface Poll {
  _id: string;
  question: string;
  options: Array<{
    text: string;
    votes: number;
  }>;
  createdBy: User;
  votedBy: Array<{
    userId: string;
    optionIndex: number;
  }>;
  isWouldYouRather: boolean;
  createdAt: string;
}

export interface FakeProfile {
  name: string;
  avatar: string;
}

export interface ConfessionComment {
  text: string;
  fakeProfile: FakeProfile;
  createdAt: string;
}

export interface Confession {
  _id: string;
  text: string;
  likes: number;
  likedBy: string[];
  comments: ConfessionComment[];
  fakeProfile: FakeProfile;
  createdAt: string;
}

export interface Theme {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Leaderboard {
  topFunny: Post[];
  activeUsers: User[];
  topReacted: Post[];
  hallOfFame: User[];
}

export type EmojiType = "love";
