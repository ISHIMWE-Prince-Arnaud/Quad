import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Post } from '../types';
import { postsAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import PostCard from '../components/feed/PostCard';
import PostSkeleton from '../components/common/PostSkeleton';
import EmptyState from '../components/common/EmptyState';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { socket } = useSocket();
  const observerTarget = useRef<HTMLDivElement>(null);

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

  // Infinite scroll setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          loadPosts(currentPage + 1, true);
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

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updatedPost._id ? updatedPost : post))
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feed</h1>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feed</h1>
      
      {posts.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No posts yet"
          description="Be the first to share a photo or video with the community!"
        />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
          ))}

          {/* Infinite scroll trigger */}
          {hasNextPage && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {loadingMore && <PostSkeleton />}
            </div>
          )}

          {/* End of feed message */}
          {!hasNextPage && posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">You're all caught up! 🎉</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FeedPage;
