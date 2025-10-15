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
  const { reactToPost, addComment } = usePostStore();
  const { user } = useAuthStore();

  const emojiIcons = {
    laugh: { icon: Laugh, color: "text-yellow-500" },
    cry: { icon: Frown, color: "text-blue-500" },
    love: { icon: Heart, color: "text-pink-500" },
    angry: { icon: Angry, color: "text-red-500" },
  };

  // Real-time updates
  useEffect(() => {
    socketService.subscribeToPostReactions((data: PostReactionData) => {
      if (data.postId === post._id)
        reactToPost(data.postId, data.reaction as EmojiType);
    });

    socketService.subscribeToNewComments((data: PostCommentData) => {
      if (data.postId === post._id) addComment(data.postId, data.comment.text);
    });

    socketService.joinPostRoom(post._id);
    return () => socketService.leavePostRoom(post._id);
  }, [post._id]);

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
    if (!commentText.trim()) return;

    try {
      const newComment = await addComment(post._id, commentText);
      setCommentText("");
      socketService.emitPostComment(post._id, newComment);
      toast.success("Comment added!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const userReaction = post.reactedBy?.find((r) => r.userId === user?._id);

  return (
    <div className="max-w-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 mx-auto my-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
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

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm hover:bg-primary/20 transition">
                #{tag}
              </span>
            ))}
          </div>
        )}

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
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}>
                  <Icon size={16} className={`${color}`} />
                  <span>
                    {post.reactions[emoji as keyof typeof post.reactions]}
                  </span>
                </button>
              )
            )}
          </div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <MessageCircle size={18} />
            <span>{post.comments.length}</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="mt-4 space-y-3 animate-fadeIn">
            {post.comments.map((comment) => (
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

            {/* Comment form */}
            <form onSubmit={handleComment} className="flex gap-2 mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none p-2"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="btn btn-primary px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white font-semibold shadow-md hover:shadow-lg transition-all">
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
