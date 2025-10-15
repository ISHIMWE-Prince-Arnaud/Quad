import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Laugh,
  Frown,
  Angry,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Gauge,
} from "lucide-react";
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

const MAX_POST_HEIGHT = 700;
const MAX_MEDIA_HEIGHT = 500;

const PostCard = ({ post }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const likeTimeout = useRef<number | null>(null); // Changed from NodeJS.Timeout to number | null

  // --- video states ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const { reactToPost, addComment } = usePostStore();
  const { user } = useAuthStore();

  const emojiIcons = {
    laugh: { icon: Laugh, color: "text-yellow-500" },
    cry: { icon: Frown, color: "text-blue-500" },
    love: { icon: Heart, color: "text-pink-500" },
    angry: { icon: Angry, color: "text-red-500" },
  };

  useEffect(() => setLocalPost(post), [post]);

  useEffect(() => {
    if (!post?.mediaUrl) return;
    if (post.mediaType === "image") {
      const img = new Image();
      img.onload = () => setAspectRatio(`${img.width} / ${img.height}`);
      img.src = post.mediaUrl;
    } else if (post.mediaType === "video") {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        setAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
      };
      video.src = post.mediaUrl;
    }
  }, [post.mediaUrl, post.mediaType]);

  useEffect(() => {
    const handleReaction = (data: PostReactionData) => {
      if (data.postId === post._id && data.userId !== user?._id) {
        reactToPost(data.postId, data.reaction as EmojiType);
      }
    };
    const handleComment = (data: PostCommentData) => {
      if (data.postId === post._id && data.comment.userId._id !== user?._id) {
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

  // --- video control logic ---
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    const currentProgress = (video.currentTime / video.duration) * 100;
    setProgress(currentProgress);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const resetVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handlePlaybackSpeed = () => {
    const video = videoRef.current;
    if (!video) return;
    const newRate = playbackRate === 2 ? 0.5 : playbackRate + 0.5;
    video.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = post.mediaUrl;
    a.download = post.mediaUrl.split("/").pop() || "video.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDoubleTap = () => {
    if (likeTimeout.current) {
      clearTimeout(likeTimeout.current); // Use clearTimeout with number
      likeTimeout.current = null;
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      handleReact("love");
    } else {
      likeTimeout.current = setTimeout(() => {
        likeTimeout.current = null;
      }, 300);
    }
  };

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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const userReaction = localPost.reactedBy?.find((r) => r.userId === user?._id);

  return (
    <div
      className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 mx-auto my-4 overflow-hidden flex flex-col"
      style={{ maxHeight: MAX_POST_HEIGHT }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 flex-shrink-0">
        <img
          src={post.userId.avatar}
          alt={post.userId.username}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
        />
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
      {post.mediaUrl && (
        <div
          className="relative w-full bg-black rounded-2xl overflow-hidden mx-auto max-w-[90%] flex justify-center items-center"
          style={{
            aspectRatio: aspectRatio || "auto",
            maxHeight: MAX_MEDIA_HEIGHT,
          }}>
          {post.mediaType === "video" ? (
            <div
              className="relative w-full h-full group"
              onDoubleClick={handleDoubleTap}>
              <video
                ref={videoRef}
                src={post.mediaUrl}
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={togglePlay}
                muted={isMuted}
              />

              {/* Heart animation */}
              {showHeart && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping">
                  <Heart size={90} className="text-pink-500 drop-shadow-xl" />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Center play/pause */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {isPlaying ? (
                  <Pause size={70} className="drop-shadow-lg" />
                ) : (
                  <Play size={70} className="drop-shadow-lg" />
                )}
              </button>

              {/* Controls */}
              <div className="absolute bottom-3 left-0 right-0 flex flex-col px-4 mx-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress */}
                <div className="relative h-2 rounded-full bg-white/20 overflow-hidden mb-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-[gradientMove_3s_linear_infinite]"
                    style={{
                      width: `${progress}%`,
                      transition: "width 0.1s linear",
                      backgroundSize: "200% 200%",
                    }}
                  />
                </div>

                {/* Bottom buttons */}
                <div className="flex items-center justify-between bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 text-white">
                  <div className="flex items-center gap-3">
                    <button onClick={togglePlay}>
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button onClick={resetVideo}>
                      <RotateCcw size={20} />
                    </button>
                    <button onClick={toggleMute}>
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <button onClick={handlePlaybackSpeed}>
                      <Gauge size={20} />
                      <span className="ml-1 text-sm">{playbackRate}x</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span>
                      {Math.floor(currentTime / 60)}:
                      {String(Math.floor(currentTime % 60)).padStart(2, "0")}
                    </span>
                    /
                    <span>
                      {Math.floor(duration / 60)}:
                      {String(Math.floor(duration % 60)).padStart(2, "0")}
                    </span>
                    <button onClick={handleDownload}>
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={post.mediaUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      {/* Caption */}
      <div className="px-5 pt-4 text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed flex-shrink-0">
        {post.caption}
      </div>

      {/* Reactions */}
      <div className="px-5 pb-4 mt-3 border-t border-gray-200 dark:border-gray-800 pt-3 flex items-center justify-between flex-shrink-0">
        <div className="flex gap-2 flex-wrap">
          {Object.entries(emojiIcons).map(([emoji, { icon: Icon, color }]) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji as EmojiType)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                userReaction?.emoji === emoji
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}>
              <Icon size={16} className={color} />
              <span>
                {localPost.reactions[emoji as keyof typeof localPost.reactions]}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <MessageCircle size={18} />
          <span>{localPost.comments.length}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-5 space-y-3 overflow-y-auto">
          {localPost.comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
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

          {/* Comment Form */}
          <form onSubmit={handleComment} className="flex gap-2 mt-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-transparent rounded-full px-4 py-2 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="px-4 py-2 rounded-full font-semibold text-white transition-all disabled:bg-red-500 bg-primary hover:bg-primary/90 disabled:cursor-not-allowed">
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;