import { Hash, TrendingUp } from 'lucide-react';

const Sidebar = () => {
  const trendingTags = [
    { tag: 'schoollife', count: 234 },
    { tag: 'fail', count: 189 },
    { tag: 'relatable', count: 156 },
    { tag: 'professor', count: 143 },
    { tag: 'exams', count: 128 },
    { tag: 'dormlife', count: 112 },
    { tag: 'cafeteria', count: 98 },
    { tag: 'weekend', count: 87 },
  ];

  return (
    <aside className="hidden lg:block w-80 bg-white dark:bg-dark-card rounded-xl shadow-md p-6 sticky top-20 h-fit">
      {/* Trending Tags */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={20} className="text-primary" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Trending Tags
          </h2>
        </div>
        <div className="space-y-2">
          {trendingTags.map((item) => (
            <button
              key={item.tag}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center space-x-2">
                <Hash size={16} className="text-gray-500 group-hover:text-primary" />
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary">
                  {item.tag}
                </span>
              </div>
              <span className="text-sm text-gray-500">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
          Community Stats
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Active Users</span>
            <span className="font-bold text-primary">1,234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Posts Today</span>
            <span className="font-bold text-primary">89</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total Reactions</span>
            <span className="font-bold text-primary">12.5k</span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mt-6 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Quad! 🎉
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Share your funniest moments, vote on polls, and connect with fellow students.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
