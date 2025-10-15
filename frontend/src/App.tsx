import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import EntertainmentBoard from './pages/EntertainmentBoard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme === 'dark');
    }
  }, []);

  return (
    <Router>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-white">
          <Navbar />
          
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
            <Route path="/entertainment" element={<PrivateRoute><EntertainmentBoard /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/confess" element={<PrivateRoute><EntertainmentBoard /></PrivateRoute>} />
          </Routes>

          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDark ? 'dark' : 'light'}
          />
        </div>
      </div>
    </Router>
  );
}

export default App;
