import React, { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Confession, Thought } from '../../types';
import { confessionsAPI } from '../../services/api';
import { formatTimeAgo, formatFullDateTime } from '../../utils/formatTimeAgo';
import Button from '../common/Button';
import Input from '../common/Input';

interface ConfessionCardProps {
  confession: Confession;
  onUpdate?: (confession: Confession) => void;
}

const ConfessionCard: React.FC<ConfessionCardProps> = ({ confession, onUpdate }) => {
  const [showThoughts, setShowThoughts] = useState(false);
  const [thoughtText, setThoughtText] = useState('');
  const [loading, setLoading] = useState(false);

  // Get anonymous ID from localStorage
  const getAnonymousId = () => {
    let anonId = localStorage.getItem('anonymousAuthorId');
    if (!anonId) {
      anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymousAuthorId', anonId);
    }
    return anonId;
  };

  const anonymousId = getAnonymousId();
  const isLiked = confession.likes.includes(anonymousId);

  const handleLike = async () => {
    try {
      const response = await confessionsAPI.likeConfession(confession._id, anonymousId);
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to like confession:', error);
    }
  };

  const handleAddThought = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtText.trim()) return;

    setLoading(true);
    try {
      const response = await confessionsAPI.addThought(confession._id, thoughtText.trim(), anonymousId);
      if (onUpdate) {
        onUpdate(response.data.confession);
      }
      setThoughtText('');
    } catch (error) {
      console.error('Failed to add thought:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg shadow-md overflow-hidden border-2 border-purple-200 dark:border-purple-800">
      {/* Header with mask icon */}
      <div className="px-4 py-3 flex items-center gap-3 bg-purple-100 dark:bg-purple-900/30">
        <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center overflow-hidden">
          <img src={confession.anonymousAvatar} alt={confession.anonymousUsername} className="w-full h-full" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎭</span>
            <p className="font-semibold text-purple-900 dark:text-purple-200">{confession.anonymousUsername}</p>
          </div>
          <p className="text-xs text-purple-700 dark:text-purple-300" title={formatFullDateTime(confession.createdAt)}>
            {formatTimeAgo(confession.createdAt)}
          </p>
        </div>
      </div>

      {/* Media */}
      {confession.mediaUrl && (
        <div className="relative bg-black">
          {confession.mediaType === 'video' ? (
            <video src={confession.mediaUrl} controls className="w-full max-h-80 object-contain" />
          ) : (
            <img src={confession.mediaUrl} alt="Confession" className="w-full max-h-80 object-contain" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{confession.content}</p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 space-y-2 border-t border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-purple-700 dark:text-purple-300 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-red-500' : ''} />
            <span className="font-medium">{confession.likes.length}</span>
          </button>
          
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className="flex items-center gap-2 text-purple-700 dark:text-purple-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          >
            <MessageCircle size={24} />
            <span className="font-medium">{confession.thoughts.length}</span>
          </button>
        </div>
      </div>

      {/* Thoughts Section */}
      {showThoughts && (
        <div className="px-4 pb-4 border-t border-purple-200 dark:border-purple-800 pt-3 space-y-3">
          {/* Add Thought Form */}
          <form onSubmit={handleAddThought} className="flex gap-2">
            <Input
              placeholder="Share your thoughts anonymously..."
              value={thoughtText}
              onChange={(e) => setThoughtText(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !thoughtText.trim()}>
              Post
            </Button>
          </form>

          {/* Thoughts List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {confession.thoughts.map((thought, index) => (
              <div key={index} className="flex gap-3 bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-purple-700 dark:text-purple-300 mr-2">Anonymous</span>
                    <span className="text-gray-700 dark:text-gray-300">{thought.content}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" title={formatFullDateTime(thought.createdAt)}>
                    {formatTimeAgo(thought.createdAt)}
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

export default ConfessionCard;
