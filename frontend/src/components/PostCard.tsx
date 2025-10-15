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
    laugh: { icon: Laugh, label: "Haha", color: "text-yellow-500" },
    cry: { icon: Frown, label: "Sad", color: "text-blue-500" },
    love: { icon: Heart, label: "Love", color: "text-red-500" },
    angry: { icon: Angry, label: "Angry", color: "text-orange-500" },
  };

  // Socket.IO event handlers
  useEffect(() => {
    // Subscribe to post reactions
    socketService.subscribeToPostReactions((data: PostReactionData) => {
      if (data.postId === post._id) {
        // Update post reactions in store
        reactToPost(data.postId, data.reaction as EmojiType);
      }
    });

    // Subscribe to new comments
    socketService.subscribeToNewComments((data: PostCommentData) => {
      if (data.postId === post._id) {
        // Update comments in store
        addComment(data.postId, data.comment.text);
      }
    });

    // Join post room for real-time updates
    socketService.joinPostRoom(post._id);

    return () => {
      socketService.leavePostRoom(post._id);
    };
  }, [post._id]);

  const handleReact = async (emoji: EmojiType) => {
    try {
      await reactToPost(post._id, emoji);
      // Emit reaction event
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
      // Emit comment event
      socketService.emitPostComment(post._id, newComment);
      toast.success("Comment added!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const userReaction = post.reactedBy?.find((r) => r.userId === user?._id);

  return (
    <div className="card bg-base-100 shadow-xl max-w-3xl mx-auto">
      {/* Header */}
      <div className="card-body pb-0">
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img src={post.userId.avatar} alt={post.userId.username} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">{post.userId.username}</h3>
            <time className="text-sm opacity-70">
              {formatDate(post.createdAt)}
            </time>
          </div>
        </div>
      </div>

      {/* Media */}
      <figure className="relative">
        {post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full aspect-[4/3] object-contain bg-base-200"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="w-full aspect-[4/3] object-contain bg-base-200"
          />
        )}
        {post.isTopPost && (
          <div className="badge badge-accent absolute top-4 right-4 gap-1">
            <span className="font-bold">★</span>
            <span>Top Post</span>
          </div>
        )}
      </figure>

      {/* Content */}
      <div className="card-body pt-4">
        <p className="mb-3">{post.caption}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="link link-primary text-sm no-underline hover:underline">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Theme Badge */}
        {post.theme && (
          <div className="badge badge-secondary gap-1 mb-3">
            <span className="font-normal">Theme:</span> {post.theme}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center justify-between border-t pt-3 mb-3">
          <div className="flex space-x-1">
            {Object.entries(emojiIcons).map(
              ([emoji, { icon: Icon, color, label }]) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji as EmojiType)}
                  className={`btn btn-sm gap-1 ${
                    userReaction?.emoji === emoji
                      ? "btn-primary"
                      : "btn-ghost hover:btn-primary hover:btn-outline"
                  }`}>
                  <Icon size={18} />
                  <span>
                    {post.reactions[emoji as keyof typeof post.reactions]}
                  </span>
                  <span className="hidden md:inline">{label}</span>
                </button>
              )
            )}
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="btn btn-ghost btn-sm gap-1">
            <MessageCircle size={18} />
            <span>{post.comments.length}</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-3 mt-2">
            {post.comments.map((comment) => (
              <div key={comment._id} className="bg-base-200 rounded-lg p-3">
                <div className="flex space-x-3">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img
                        src={comment.userId.avatar}
                        alt={comment.userId.username}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.userId.username}
                      </span>
                      <time className="text-xs opacity-70">
                        {formatDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Comment Form */}
            <form onSubmit={handleComment} className="flex gap-2 mt-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="input input-bordered flex-1"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="btn btn-primary">
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
