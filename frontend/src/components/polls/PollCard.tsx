import React from 'react';
import { Poll } from '../../types';
import { pollsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo, formatFullDateTime } from '../../utils/formatTimeAgo';

interface PollCardProps {
  poll: Poll;
  onUpdate?: (poll: Poll) => void;
}

const PollCard: React.FC<PollCardProps> = ({ poll, onUpdate }) => {
  const { user } = useAuth();

  // Check if user has voted
  const userVote = poll.options.findIndex(option => 
    user ? option.votes.includes(user.id) : false
  );
  const hasVoted = userVote !== -1;

  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);

  const handleVote = async (optionIndex: number) => {
    try {
      const response = await pollsAPI.votePoll(poll._id, optionIndex);
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
          {poll.author.profilePicture ? (
            <img src={poll.author.profilePicture} alt={poll.author.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-600 dark:text-primary-400 font-semibold">{poll.author.username[0].toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{poll.author.username}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400" title={formatFullDateTime(poll.createdAt)}>
            {formatTimeAgo(poll.createdAt)}
          </p>
        </div>
      </div>

      {/* Media */}
      {poll.mediaUrl && (
        <div className="relative bg-black">
          {poll.mediaType === 'video' ? (
            <video src={poll.mediaUrl} controls className="w-full max-h-80 object-contain" />
          ) : (
            <img src={poll.mediaUrl} alt="Poll" className="w-full max-h-80 object-contain" />
          )}
        </div>
      )}

      {/* Question */}
      <div className="px-4 py-3">
        {poll.isWouldYouRather && (
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded mb-2">
            Would You Rather
          </span>
        )}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{poll.question}</h3>
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {poll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
          const isUserChoice = index === userVote;

          return (
            <div key={index}>
              {!hasVoted ? (
                <button
                  onClick={() => handleVote(index)}
                  className="w-full text-left px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                >
                  <span className="text-gray-900 dark:text-white font-medium">{option.text}</span>
                </button>
              ) : (
                <div
                  className={`relative px-4 py-3 border-2 rounded-lg overflow-hidden ${
                    isUserChoice
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {/* Progress Bar */}
                  <div
                    className={`absolute inset-0 ${
                      isUserChoice
                        ? 'bg-primary-100 dark:bg-primary-900/30'
                        : 'bg-gray-100 dark:bg-gray-700/30'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-between">
                    <span className={`font-medium ${isUserChoice ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                      {option.text} {isUserChoice && '✓'}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{option.votes.length} votes</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {hasVoted && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total votes: {totalVotes}
          </p>
        )}
      </div>
    </div>
  );
};

export default PollCard;
