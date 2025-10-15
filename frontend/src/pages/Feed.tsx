import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PostCard from '../components/PostCard';
import Sidebar from '../components/Sidebar';
import UploadModal from '../components/UploadModal';
import { usePostStore } from '../store/postStore';
import api from '../utils/api';
import { Theme } from '../types';

const Feed = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const { posts, isLoading, currentFilter, fetchPosts, setFilter } = usePostStore();

  useEffect(() => {
    fetchPosts();
    
    // Fetch current theme
    api.get('/themes/current')
      .then(res => setCurrentTheme(res.data))
      .catch(() => {});
  }, [fetchPosts]);

  const filters = [
    { value: 'newest', label: '🆕 Newest', icon: '🆕' },
    { value: 'top', label: '🔥 Top of the Week', icon: '🔥' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Theme Banner */}
        {currentTheme && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">🎭 {currentTheme.title}</h2>
                <p className="text-purple-100">{currentTheme.description}</p>
              </div>
              <div className="hidden md:block text-6xl">🎉</div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-2">
                {filters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilter(filter.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentFilter === filter.value
                        ? 'bg-primary text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Create Post</span>
              </button>
            </div>

            {/* Posts Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No posts yet. Be the first to share! 🚀
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <Sidebar />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
};

export default Feed;
