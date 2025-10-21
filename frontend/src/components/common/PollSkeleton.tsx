import React from 'react';

const PollSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        </div>
      </div>

      {/* Question */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>

      {/* Options */}
      <div className="space-y-3">
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};

export default PollSkeleton;
