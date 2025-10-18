import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo, formatFullDateTime } from '../../utils/formatTimeAgo';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.author._id;

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {message.author.profilePicture ? (
            <img src={message.author.profilePicture} alt={message.author.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">{message.author.username[0].toUpperCase()}</span>
          )}
        </div>
      )}

      {/* Message */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {!isOwnMessage && (
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{message.author.username}</span>
        )}
        
        <div className={`rounded-lg px-4 py-2 ${
          isOwnMessage
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
        }`}>
          {message.mediaUrl && (
            <div className="mb-2">
              {message.mediaType === 'video' ? (
                <video src={message.mediaUrl} controls className="max-w-full rounded" style={{ maxHeight: '200px' }} />
              ) : (
                <img src={message.mediaUrl} alt="Message media" className="max-w-full rounded" style={{ maxHeight: '200px' }} />
              )}
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        <span 
          className="text-xs text-gray-500 dark:text-gray-400 mt-1" 
          title={formatFullDateTime(message.createdAt)}
        >
          {formatTimeAgo(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
