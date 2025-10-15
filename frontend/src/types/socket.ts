export interface PostReactionData {
  postId: string;
  reaction: string;
  userId: string;
}

export interface PostCommentData {
  postId: string;
  comment: {
    _id: string;
    text: string;
    userId: {
      _id: string;
      username: string;
      avatar: string;
    };
    createdAt: string;
  };
}

export interface UserTypingData {
  userId: string;
  postId: string;
}
