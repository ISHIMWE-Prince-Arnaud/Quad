import React from 'react';

const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>

      {/* Media */}
      <div className="w-full h-96 bg-gray-300 dark:bg-gray-700"></div>

      {/* Actions */}
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;
