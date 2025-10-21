import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Icon size={40} className="text-gray-400 dark:text-gray-500" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {description}
          </p>
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
