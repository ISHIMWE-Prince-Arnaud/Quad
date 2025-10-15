import { useState } from 'react';
import { Heart, MessageCircle, Flag, Laugh, Frown, HeartCrack, Angry } from 'lucide-react';
import { Post, EmojiType } from '../types';
import { formatDate } from '../utils/formatDate';
import { usePostStore } from '../store/postStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { reactToPost, addComment, reportPost } = usePostStore();
  const { user } = useAuthStore();

  const emojiIcons = {
    laugh: { icon: Laugh, label: '😂', color: 'text-yellow-500' },
    cry: { icon: Frown, label: '😭', color: 'text-blue-500' },
    love: { icon: Heart, label: '❤️', color: 'text-red-500' },
    angry: { icon: Angry, label: '😡', color: 'text-orange-500' },
  };

  const handleReact = async (emoji: EmojiType) => {
    try {
      await reactToPost(post._id, emoji);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment(post._id, commentText);
      setCommentText('');
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReport = async () => {
    if (window.confirm('Are you sure you want to report this post?')) {
      try {
        await reportPost(post._id);
        toast.success('Post reported');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const userReaction = post.reactedBy?.find(r => r.userId === user?._id);

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={post.userId.avatar}
            alt={post.userId.username}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.userId.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <button
          onClick={handleReport}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Report post"
        >
          <Flag size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Media */}
      <div className="relative">
        {post.mediaType === 'video' ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full max-h-[600px] object-cover"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="w-full max-h-[600px] object-cover"
          />
        )}
        {post.isTopPost && (
          <div className="absolute top-4 right-4 bg-accent text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
            <span>🏆</span>
            <span>Top Post</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-800 dark:text-gray-200 mb-3">{post.caption}</p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-primary dark:text-accent font-medium hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Theme Badge */}
        {post.theme && (
          <div className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm mb-3">
            🎭 {post.theme}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
          <div className="flex space-x-1">
            {Object.entries(emojiIcons).map(([emoji, { icon: Icon, label, color }]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji as EmojiType)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                  userReaction?.emoji === emoji
                    ? 'bg-primary text-white scale-110'
                    : 'bg-gray-100 dark:bg-gray-700 hover:scale-105'
                }`}
              >
                <Icon size={18} className={userReaction?.emoji === emoji ? 'text-white' : color} />
                <span className="text-sm font-medium">
                  {post.reactions[emoji as keyof typeof post.reactions]}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{post.comments.length}</span>
          </button>
        </div>

        {/* Comments */}
        {showComments && (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div key={comment._id} className="flex space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <img
                  src={comment.userId.avatar}
                  alt={comment.userId.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {comment.userId.username}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}

            {/* Comment Form */}
            <form onSubmit={handleComment} className="flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
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
