/**
 * Type definitions for the Quad application
 */

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string | null;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  likes: string[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  post: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string | null;
  };
  content: string;
  createdAt: string;
}

export interface PollOption {
  text: string;
  votes: string[];
}

export interface Poll {
  _id: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string | null;
  };
  question: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  options: PollOption[];
  isWouldYouRather: boolean;
  createdAt: string;
}

export interface Thought {
  anonymousAuthorId: string;
  content: string;
  createdAt: string;
}

export interface Confession {
  _id: string;
  anonymousAuthorId: string;
  anonymousUsername: string;
  anonymousAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  thoughts: Thought[];
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string | null;
  };
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
