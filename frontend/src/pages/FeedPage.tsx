import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { postsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import PostCard from '../components/feed/PostCard';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    loadPosts();
  }, []);

  // Listen for new posts via Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('new_post', (newPost: Post) => {
        setPosts((prev) => [newPost, ...prev]);
      });

      socket.on('update_post_likes', (data: { postId: string; likes: string[] }) => {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === data.postId ? { ...post, likes: data.likes } : post
          )
        );
      });

      return () => {
        socket.off('new_post');
        socket.off('update_post_likes');
      };
    }
  }, [socket]);

  const loadPosts = async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      }

      const response = await postsAPI.getPosts(page, 20);
      const postsData = response.data.posts || response.data;
      const pagination = response.data.pagination;

      if (append) {
        setPosts((prev) => [...prev, ...postsData]);
      } else {
        setPosts(postsData);
      }

      setCurrentPage(page);
      setHasNextPage(pagination?.hasNextPage || false);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasNextPage) {
      loadPosts(currentPage + 1, true);
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feed</h1>
      
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
          ))}

          {hasNextPage && (
            <div className="flex justify-center">
              <button
                onClick={loadMorePosts}
                disabled={loadingMore}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedPage;
