import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Post, Comment as CommentType } from '../../types';
import { postsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatTimeAgo, formatFullDateTime } from '../../utils/formatTimeAgo';
import Button from '../common/Button';
import Input from '../common/Input';

interface PostCardProps {
  post: Post;
  onUpdate?: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();

  const isLiked = user ? post.likes.includes(user.id) : false;

  // Load comments when toggled
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments]);

  // Listen for new comments via Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('new_comment', (data: { postId: string; comment: CommentType }) => {
        if (data.postId === post._id) {
          setComments((prev) => [data.comment, ...prev]);
        }
      });

      return () => {
        socket.off('new_comment');
      };
    }
  }, [socket, post._id]);

  const loadComments = async () => {
    try {
      const response = await postsAPI.getComments(post._id);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await postsAPI.likePost(post._id);
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await postsAPI.addComment(post._id, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
          {post.author.profilePicture ? (
            <img src={post.author.profilePicture} alt={post.author.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-600 dark:text-primary-400 font-semibold">{post.author.username[0].toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{post.author.username}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400" title={formatFullDateTime(post.createdAt)}>
            {formatTimeAgo(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Media */}
      <div className="relative bg-black">
        {post.mediaType === 'video' ? (
          <video src={post.mediaUrl} controls className="w-full max-h-[600px] object-contain" />
        ) : (
          <img src={post.mediaUrl} alt="Post" className="w-full max-h-[600px] object-contain" />
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-red-500' : ''} />
            <span className="font-medium">{post.likes.length}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <MessageCircle size={24} />
            <span className="font-medium">{comments.length}</span>
          </button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-gray-900 dark:text-white">
            <span className="font-semibold mr-2">{post.author.username}</span>
            {post.caption}
          </p>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !commentText.trim()}>
              Post
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {comment.author.profilePicture ? (
                    <img src={comment.author.profilePicture} alt={comment.author.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">{comment.author.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white mr-2">{comment.author.username}</span>
                    <span className="text-gray-700 dark:text-gray-300">{comment.content}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" title={formatFullDateTime(comment.createdAt)}>
                    {formatTimeAgo(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
