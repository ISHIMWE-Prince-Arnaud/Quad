import React, { useState, useEffect, useRef } from 'react';
import { VenetianMask } from 'lucide-react';
import { Confession } from '../types';
import { confessionsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import ConfessionCard from '../components/confessions/ConfessionCard';
import ConfessionSkeleton from '../components/common/ConfessionSkeleton';
import EmptyState from '../components/common/EmptyState';

const ConfessionsPage: React.FC = () => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { socket } = useSocket();
  const observerTarget = useRef<HTMLDivElement>(null);

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

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          loadConfessions(currentPage + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, loadingMore, currentPage]);

  const loadConfessions = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }

      const response = await confessionsAPI.getConfessions(page, 20);
      const confessionsData = response.data.confessions || response.data;
      const pagination = response.data.pagination;

      if (append) {
        setConfessions((prev) => [...prev, ...confessionsData]);
      } else {
        setConfessions(confessionsData);
      }

      setCurrentPage(page);
      setHasNextPage(pagination?.hasNextPage || false);
    } catch (error) {
      console.error('Failed to load confessions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">🎭</span> Confessions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Share your thoughts anonymously</p>
        </div>
        <ConfessionSkeleton />
        <ConfessionSkeleton />
        <ConfessionSkeleton />
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
        <EmptyState
          icon={VenetianMask}
          title="No confessions yet"
          description="Share your thoughts anonymously. No one will know it's you!"
        />
      ) : (
        <>
          {confessions.map((confession) => (
            <ConfessionCard
              key={confession._id}
              confession={confession}
              onUpdate={handleConfessionUpdate}
            />
          ))}

          {/* Infinite scroll trigger */}
          {hasNextPage && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {loadingMore && <ConfessionSkeleton />}
            </div>
          )}

          {/* End of confessions message */}
          {!hasNextPage && confessions.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">All confessions revealed 🎭</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConfessionsPage;
