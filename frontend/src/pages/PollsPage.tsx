import React, { useState, useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';
import { Poll } from '../types';
import { pollsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import PollCard from '../components/polls/PollCard';
import PollSkeleton from '../components/common/PollSkeleton';
import EmptyState from '../components/common/EmptyState';

const PollsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'regular' | 'would-you-rather'>('all');
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { socket } = useSocket();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPolls();
  }, [activeTab]);

  // Listen for new polls and vote updates via Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('new_poll', (newPoll: Poll) => {
        if (
          activeTab === 'all' ||
          (activeTab === 'regular' && !newPoll.isWouldYouRather) ||
          (activeTab === 'would-you-rather' && newPoll.isWouldYouRather)
        ) {
          setPolls((prev) => [newPoll, ...prev]);
        }
      });

      socket.on('update_poll_votes', (updatedPoll: Poll) => {
        setPolls((prev) =>
          prev.map((poll) => (poll._id === updatedPoll._id ? updatedPoll : poll))
        );
      });

      return () => {
        socket.off('new_poll');
        socket.off('update_poll_votes');
      };
    }
  }, [socket, activeTab]);

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          loadPolls(currentPage + 1, true);
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

  const loadPolls = async (page: number = 1, append: boolean = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const type = activeTab === 'all' ? undefined : activeTab;
      const response = await pollsAPI.getPolls(type, page, 20);
      const pollsData = response.data.polls || response.data;
      const pagination = response.data.pagination;

      if (append) {
        setPolls((prev) => [...prev, ...pollsData]);
      } else {
        setPolls(pollsData);
      }

      setCurrentPage(page);
      setHasNextPage(pagination?.hasNextPage || false);
    } catch (error) {
      console.error('Failed to load polls:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handlePollUpdate = (updatedPoll: Poll) => {
    setPolls((prev) =>
      prev.map((poll) => (poll._id === updatedPoll._id ? updatedPoll : poll))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Polls</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          All Polls
        </button>
        <button
          onClick={() => setActiveTab('regular')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'regular'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Polls
        </button>
        <button
          onClick={() => setActiveTab('would-you-rather')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'would-you-rather'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Would You Rather
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <PollSkeleton />
          <PollSkeleton />
          <PollSkeleton />
        </div>
      ) : polls.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No polls yet"
          description="Create the first poll and get opinions from the community!"
        />
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => (
            <PollCard key={poll._id} poll={poll} onUpdate={handlePollUpdate} />
          ))}

          {/* Infinite scroll trigger */}
          {hasNextPage && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {loadingMore && <PollSkeleton />}
            </div>
          )}

          {/* End of polls message */}
          {!hasNextPage && polls.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No more polls to show 🎯</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PollsPage;
