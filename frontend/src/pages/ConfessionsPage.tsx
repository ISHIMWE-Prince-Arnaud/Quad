import React, { useState, useEffect } from 'react';
import { Confession } from '../types';
import { confessionsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import ConfessionCard from '../components/confessions/ConfessionCard';

const ConfessionsPage: React.FC = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    loadConfessions();
  }, []);

  // Listen for new confessions and updates via Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('new_confession', (newConfession: Confession) => {
        setConfessions((prev) => [newConfession, ...prev]);
      });

      socket.on('update_confession_likes', (data: { confessionId: string; likesCount: number }) => {
        setConfessions((prev) =>
          prev.map((confession) =>
            confession._id === data.confessionId
              ? { ...confession, likes: Array(data.likesCount).fill('') }
              : confession
          )
        );
      });

      socket.on('new_thought', (data: { confessionId: string; thought: any }) => {
        setConfessions((prev) =>
          prev.map((confession) =>
            confession._id === data.confessionId
              ? { ...confession, thoughts: [...confession.thoughts, data.thought] }
              : confession
          )
        );
      });

      return () => {
        socket.off('new_confession');
        socket.off('update_confession_likes');
        socket.off('new_thought');
      };
    }
  }, [socket]);

  const loadConfessions = async () => {
    try {
      const response = await confessionsAPI.getConfessions();
      setConfessions(response.data);
    } catch (error) {
      console.error('Failed to load confessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfessionUpdate = (updatedConfession: Confession) => {
    setConfessions((prev) =>
      prev.map((confession) =>
        confession._id === updatedConfession._id ? updatedConfession : confession
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading confessions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-3xl">🎭</span> Confessions
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Share your thoughts anonymously</p>
      </div>

      {confessions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No confessions yet. Share yours anonymously!</p>
        </div>
      ) : (
        confessions.map((confession) => (
          <ConfessionCard
            key={confession._id}
            confession={confession}
            onUpdate={handleConfessionUpdate}
          />
        ))
      )}
    </div>
  );
};

export default ConfessionsPage;
