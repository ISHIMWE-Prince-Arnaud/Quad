import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Play, Pause, Volume2, VolumeX, Maximize, Download } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showPlaybackMenu, setShowPlaybackMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoClick = () => {
    togglePlayPause();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowPlaybackMenu(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(post.mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `post_${post._id}.${post.mediaType === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden ring-2 ring-primary-100 dark:ring-primary-900">
            {post.author.profilePicture ? (
              <img src={post.author.profilePicture} alt={post.author.username} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{post.author.username[0].toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">{post.author.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400" title={formatFullDateTime(post.createdAt)}>
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      <div className="relative bg-gradient-to-br from-gray-900 to-black group">
        {post.mediaType === 'video' ? (
          <div 
            className="relative cursor-pointer"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <video 
              ref={videoRef}
              src={post.mediaUrl}
              className="w-full max-h-[600px] object-contain"
              onClick={handleVideoClick}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              loop
            />
            
            {/* Video Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
            }`}>
              {/* Center Play/Pause Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlayPause}
                  className={`w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-all duration-300 ${
                    showControls || !isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  } hover:bg-white hover:scale-110`}
                >
                  {isPlaying ? (
                    <Pause size={32} className="text-gray-900 ml-0.5" />
                  ) : (
                    <Play size={32} className="text-gray-900 ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 space-y-2 transition-all duration-300 ${
                showControls || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
              }`}>
                {/* Progress Bar */}
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="bg-primary-500 h-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors backdrop-blur-sm"
                  >
                    {isMuted ? (
                      <VolumeX size={18} className="text-white" />
                    ) : (
                      <Volume2 size={18} className="text-white" />
                    )}
                  </button>

                  {/* Time Display */}
                  <span className="text-white text-sm font-medium px-2 py-1 bg-black/50 rounded-full backdrop-blur-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>

                  {/* Playback Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPlaybackMenu(!showPlaybackMenu)}
                      className="px-3 py-1 text-sm font-semibold text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
                    >
                      {playbackRate}x
                    </button>
                    {showPlaybackMenu && (
                      <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                              playbackRate === rate
                                ? 'bg-primary-500 text-white'
                                : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {rate}x {rate === 1 ? '(Normal)' : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors backdrop-blur-sm"
                  >
                    <Download size={18} className="text-white" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors backdrop-blur-sm ml-auto"
                  >
                    <Maximize size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img 
              src={post.mediaUrl} 
              alt="Post" 
              className="w-full max-h-[600px] object-contain cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]" 
            />
            {/* Download Button for Images */}
            <button
              onClick={handleDownload}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
            >
              <Download size={20} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-2 group transition-all duration-300"
            >
              <Heart 
                size={26} 
                fill={isLiked ? 'currentColor' : 'none'} 
                className={`transition-all duration-300 ${
                  isLiked 
                    ? 'text-red-500 scale-110' 
                    : 'text-gray-700 dark:text-gray-300 group-hover:text-red-500 dark:group-hover:text-red-400 group-hover:scale-110'
                }`}
              />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{post.likes.length}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 group transition-all duration-300"
            >
              <MessageCircle 
                size={26} 
                className="text-gray-700 dark:text-gray-300 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-all duration-300 group-hover:scale-110" 
              />
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{comments.length}</span>
            </button>
          </div>
        </div>

        {/* Like Count */}
        {post.likes.length > 0 && (
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        {post.caption && (
          <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
            <span className="font-semibold mr-2 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">{post.author.username}</span>
            {post.caption}
          </p>
        )}

        {/* View Comments */}
        {comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            View all {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-sm">{user?.username?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <Input
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !commentText.trim()} size="sm">
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 group">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-primary-200 dark:group-hover:ring-primary-800 transition-all">
                  {comment.author.profilePicture ? (
                    <img src={comment.author.profilePicture} alt={comment.author.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">{comment.author.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl px-3 py-2 inline-block max-w-full">
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white mr-1.5 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer transition-colors">{comment.author.username}</span>
                      <span className="text-gray-700 dark:text-gray-300 break-words">{comment.content}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 px-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400" title={formatFullDateTime(comment.createdAt)}>
                      {formatTimeAgo(comment.createdAt)}
                    </p>
                    <button className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      Like
                    </button>
                    <button className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                      Reply
                    </button>
                  </div>
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
