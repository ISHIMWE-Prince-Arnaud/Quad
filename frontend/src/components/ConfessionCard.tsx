import { useState } from "react";
import { ThumbsUp, MessageCircle, Send } from "lucide-react";
import { Confession } from "../types";
import api from "../utils/api";
import { toast } from "react-toastify";
import { generateFakeProfile } from "../utils/fakeProfile.ts";

export const ConfessionCard = ({
  confession,
  onLike,
}: {
  confession: Confession;
  onLike: (id: string) => void;
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(confession.comments || []);
  const { name, avatar } = generateFakeProfile();

  const handleComment = async () => {
    try {
      const response = await api.post(
        `/confessions/${confession._id}/comment`,
        {
          text: newComment,
          fakeProfile: { name, avatar },
        }
      );
      setComments([...comments, response.data]);
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <div className="flex items-start space-x-3 mb-4">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full">
              <img
                src={confession.fakeProfile?.avatar || avatar}
                alt="Anonymous"
              />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-base-content/90">
              {confession.fakeProfile?.name || name}
            </h3>
            <p className="text-base-content">{confession.text}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-base-content/70">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(confession._id)}
              className="btn btn-ghost btn-sm">
              <ThumbsUp size={16} />
              <span className="ml-1">{confession.likes}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="btn btn-ghost btn-sm">
              <MessageCircle size={16} />
              <span className="ml-1">{comments.length}</span>
            </button>
          </div>
          <span className="text-xs">
            {new Date(confession.createdAt).toLocaleDateString()}
          </span>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input input-bordered flex-1"
              />
              <button
                onClick={handleComment}
                disabled={!newComment.trim()}
                className="btn btn-primary btn-sm">
                <Send size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {comments.map((comment, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="avatar">
                    <div className="w-8 h-8 rounded-full">
                      <img src={comment.fakeProfile.avatar} alt="Anonymous" />
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-sm">
                      {comment.fakeProfile.name}
                    </span>
                    <p className="text-sm text-base-content/90">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
