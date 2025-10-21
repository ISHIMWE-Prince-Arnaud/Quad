import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import ChatMessage from '../components/chat/ChatMessage';
import MessageInput from '../components/chat/MessageInput';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadMessages();
  }, []);

  // Listen for new messages via Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('new_chat_message', (newMessage: ChatMessageType) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      return () => {
        socket.off('new_chat_message');
      };
    }
  }, [socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }

      const response = await chatAPI.getMessages(page, 50);
      const messagesData = response.data.messages || response.data;
      const pagination = response.data.pagination;

      if (append) {
        // Prepend older messages to the beginning
        setMessages((prev) => [...messagesData, ...prev]);
      } else {
        setMessages(messagesData);
      }

      setCurrentPage(page);
      setHasNextPage(pagination?.hasNextPage || false);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadOlderMessages = () => {
    if (!loadingMore && hasNextPage) {
      loadMessages(currentPage + 1, true);
    }
  };

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      if (file) {
        // Upload file via API (which handles Cloudinary upload)
        const formData = new FormData();
        formData.append('content', content);
        formData.append('media', file);

        await chatAPI.sendMessage(formData);
      } else if (socket && content.trim()) {
        // Send text-only message via socket
        socket.emit('send_chat_message', {
          content,
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Global Chat</h1>

      {/* Messages Container */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <>
              {hasNextPage && (
                <div className="flex justify-center pb-4">
                  <button
                    onClick={loadOlderMessages}
                    disabled={loadingMore}
                    className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loadingMore ? 'Loading...' : 'Load Older Messages'}
                  </button>
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage key={message._id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatPage;
