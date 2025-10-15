import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import PostCard from '../components/PostCard';
import UploadModal from '../components/UploadModal';
import { usePostStore } from '../store/postStore';
import api from '../utils/api';
import { Theme } from '../types';

const Feed = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const { posts, isLoading, fetchPosts } = usePostStore();

  useEffect(() => {
    fetchPosts();
    
    // Fetch current theme
    api.get('/themes/current')
      .then(res => setCurrentTheme(res.data))
      .catch(() => {});
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Theme Banner */}
        {currentTheme && (
          <div className="mb-6 bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">🎭 {currentTheme.title}</h2>
                <p className="text-primary-100">{currentTheme.description}</p>
              </div>
              <div className="hidden md:block text-6xl">🎉</div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">

            {/* Posts Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl shadow-card">
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
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 flex items-center justify-center z-50 group"
        aria-label="Create Post"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Upload Modal */}
      <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </div>
  );
};

export default Feed;
