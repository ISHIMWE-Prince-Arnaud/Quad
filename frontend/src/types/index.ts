export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  totalPosts?: number;
  totalReactions?: number;
  badges?: string[];
  isAdmin?: boolean;
}

export interface Post {
  _id: string;
  userId: User;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  tags: string[];
  theme: string | null;
  reactions: {
    laugh: number;
    cry: number;
    love: number;
    angry: number;
  };
  reactedBy: Array<{
    userId: string;
    emoji: 'laugh' | 'cry' | 'love' | 'angry';
  }>;
  comments: Comment[];
  isTopPost: boolean;
  isFlagged: boolean;
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

export interface Confession {
  _id: string;
  text: string;
  likes: number;
  reports: number;
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

export type EmojiType = 'laugh' | 'cry' | 'love' | 'angry';
