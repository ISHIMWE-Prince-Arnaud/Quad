import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User, MessageSquare, Moon, Sun } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const navItems = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Entertainment', path: '/entertainment', icon: Gamepad2 },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Confess', path: '/confess', icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Quad
            </div>
            <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
              Where students vibe
            </span>
          </Link>

          {/* Navigation Items */}
          {isAuthenticated && (
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} className="text-accent" /> : <Moon size={20} className="text-gray-600" />}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <img
                    src={user?.avatar}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full border-2 border-primary"
                  />
                  <span className="hidden sm:block font-medium text-gray-800 dark:text-white">
                    {user?.username}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden flex justify-around py-2 border-t border-gray-200 dark:border-gray-700">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
