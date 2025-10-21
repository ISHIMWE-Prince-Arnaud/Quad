import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '../types';
import { chatAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import ChatMessage from '../components/chat/ChatMessage';
import MessageInput from '../components/chat/MessageInput';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);
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

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(100);
      // Handle new response format with nested messages array
      const messagesData = response.data.messages || response.data;
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
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
