import React, { ReactNode, useState } from 'react';
import { Plus, Image as ImageIcon, BarChart3, VenetianMask } from 'lucide-react';
import Sidebar from './Sidebar';
import Modal from '../common/Modal';
import CreatePost from '../feed/CreatePost';
import CreatePoll from '../polls/CreatePoll';
import CreateConfession from '../confessions/CreateConfession';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'post' | 'poll' | 'confession' | null>(null);

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateTypeSelect = (type: 'post' | 'poll' | 'confession') => {
    setCreateType(type);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setCreateType(null);
  };

  const handleCreated = () => {
    handleCloseModal();
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all hover:scale-110 flex items-center justify-center z-30"
        aria-label="Create"
      >
        <Plus size={28} />
      </button>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title={createType ? `Create ${createType.charAt(0).toUpperCase() + createType.slice(1)}` : 'Create New'}
      >
        {!createType ? (
          <div className="space-y-3">
            <button
              onClick={() => handleCreateTypeSelect('post')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <ImageIcon size={24} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Create Post</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Share an image or video with a caption</p>
              </div>
            </button>

            <button
              onClick={() => handleCreateTypeSelect('poll')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <BarChart3 size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Create Poll</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ask a question with multiple options</p>
              </div>
            </button>

            <button
              onClick={() => handleCreateTypeSelect('confession')}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <VenetianMask size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white">Share Confession</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Post anonymously without revealing identity</p>
              </div>
            </button>
          </div>
        ) : createType === 'post' ? (
          <CreatePost onCreated={handleCreated} />
        ) : createType === 'poll' ? (
          <CreatePoll onCreated={handleCreated} />
        ) : (
          <CreateConfession onCreated={handleCreated} />
        )}
      </Modal>
    </div>
  );
};

export default MainLayout;
