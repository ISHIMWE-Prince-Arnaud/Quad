// Types for different content types
export interface BaseContent {
  _id: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments?: number;
  shares?: number;
  isLiked?: boolean;
}

export interface PostContent extends BaseContent {
  type: "post";
  content: string;
  images?: string[];
  author: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

export interface StoryContent extends BaseContent {
  type: "story";
  title: string;
  content: string;
  coverImage?: string;
  readTime?: number;
  author: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

export interface PollContent extends BaseContent {
  type: "poll";
  question: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  totalVotes: number;
  endsAt?: string;
  hasVoted?: boolean;
  author: {
    _id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
}

export type ContentItem = PostContent | StoryContent | PollContent;
