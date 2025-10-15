import { useState, useEffect } from "react";
import { Heart, MessageCircle, Laugh, Frown, Angry } from "lucide-react";
import { Post, EmojiType } from "../types";
import { PostReactionData, PostCommentData } from "../types/socket";
import { formatDate } from "../utils/formatDate";
import { usePostStore } from "../store/postStore";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-toastify";
import { socketService } from "../services/socketService";

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const { reactToPost, addComment } = usePostStore();
  const { user } = useAuthStore();

  const emojiIcons = {
    laugh: { icon: Laugh, color: "text-yellow-500" },
    cry: { icon: Frown, color: "text-blue-500" },
    love: { icon: Heart, color: "text-pink-500" },
    angry: { icon: Angry, color: "text-red-500" },
  };

  // Sync local post with prop changes
  useEffect(() => {
    setLocalPost(post);
  }, [post]);

  // Real-time updates - only update local state, don't make API calls
  useEffect(() => {
    const handleReaction = (data: PostReactionData) => {
      if (data.postId === post._id && data.userId !== user?._id) {
        // Only update for other users' reactions, not our own
        reactToPost(data.postId, data.reaction as EmojiType);
      }
    };

    const handleComment = (data: PostCommentData) => {
      if (data.postId === post._id && data.comment.userId._id !== user?._id) {
        // Only update for other users' comments, not our own
        setLocalPost((prev) => ({
          ...prev,
          comments: [...prev.comments, data.comment as any],
        }));
      }
    };

    socketService.subscribeToPostReactions(handleReaction);
    socketService.subscribeToNewComments(handleComment);
    socketService.joinPostRoom(post._id);

    return () => {
      socketService.leavePostRoom(post._id);
      socketService.getSocket()?.off("post:reaction", handleReaction);
      socketService.getSocket()?.off("post:newComment", handleComment);
    };
  }, [post._id, user?._id]);

  const handleReact = async (emoji: EmojiType) => {
    try {
      await reactToPost(post._id, emoji);
      socketService.emitPostReact(post._id, emoji, user?._id || "");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newComment = await addComment(post._id, commentText);
      setCommentText("");
      socketService.emitPostComment(post._id, newComment);
      toast.success("Comment added!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userReaction = localPost.reactedBy?.find((r) => r.userId === user?._id);

  return (
    <div className="max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 mx-auto my-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-gray-100 dark:border-gray-800">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full ring-2 ring-primary/20 overflow-hidden">
            <img src={post.userId.avatar} alt={post.userId.username} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            {post.userId.username}
          </h3>
          <time className="text-sm text-gray-500">
            {formatDate(post.createdAt)}
          </time>
        </div>
      </div>

      {/* Media */}
      <div className="relative bg-gray-50 dark:bg-gray-800 mx-6 rounded-lg overflow-hidden">
        {post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full aspect-[4/3] object-cover rounded-none"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="w-full aspect-[4/3] object-cover rounded-none"
          />
        )}
        {post.isTopPost && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full font-medium text-sm flex items-center gap-1 shadow">
            <span>★</span> Top Post
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <p className="text-gray-800 dark:text-gray-100 leading-relaxed">
          {post.caption}
        </p>

        {/* Theme */}
        {post.theme && (
          <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">
            Theme: {post.theme}
          </span>
        )}

        {/* Reactions */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-3">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(emojiIcons).map(
              ([emoji, { icon: Icon, color }]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji as EmojiType)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 
                  ${
                    userReaction?.emoji === emoji
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}>
                  <Icon size={16} className={`${color}`} />
                  <span>
                    {localPost.reactions[emoji as keyof typeof localPost.reactions]}
                  </span>
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition">
            <MessageCircle size={18} />
            <span>{localPost.comments.length}</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 space-y-3 animate-fadeIn">
            {/* Comment form */}
            <form onSubmit={handleComment} className="flex gap-2 pb-3 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-primary-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || isSubmitting}
                className="btn btn-primary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </form>

            {/* Comments list */}
            {localPost.comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                <div className="flex gap-3">
                  <img
                    src={comment.userId.avatar}
                    alt={comment.userId.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {comment.userId.username}
                      </span>
                      <time className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {comment.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
