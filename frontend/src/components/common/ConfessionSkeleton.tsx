import React from 'react';

const ConfessionSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-11/12"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  );
};

export default ConfessionSkeleton;
