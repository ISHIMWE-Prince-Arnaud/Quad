import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User, MessageSquare, Moon, Sun, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const LeftSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const navItems = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Entertainment', path: '/entertainment', icon: Gamepad2 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Confessions', path: '/confess', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-dark-card border-r border-light-border dark:border-dark-border shadow-lg flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-light-border dark:border-dark-border">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">Q</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              Quad
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Student Hub</p>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-light-border dark:border-dark-border space-y-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-200 text-gray-700 dark:text-gray-300"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <>
              <Sun size={20} className="text-accent-400" />
              <span className="font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={20} className="text-primary-600" />
              <span className="font-medium">Dark Mode</span>
            </>
          )}
        </button>

        {/* User Info */}
        {user && (
          <>
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-all duration-200"
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="w-10 h-10 rounded-full border-2 border-primary-500"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-red-600 dark:text-red-400"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;
