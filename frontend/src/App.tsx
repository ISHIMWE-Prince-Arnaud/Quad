import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LeftSidebar from "./components/LeftSidebar";
import Feed from "./pages/Feed";
import EntertainmentBoard from "./pages/EntertainmentBoard";
import ConfessionsPage from "./pages/ConfessionsPage";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { socketService } from "./services/socketService";

import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { setTheme, isDark } = useThemeStore();

  useEffect(() => {
    checkAuth();

    // Initialize theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme === "dark");
    } else {
      setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, [checkAuth, setTheme]);

  // Handle socket connection
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <Router>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        {/* Show sidebar only when authenticated */}
        {isAuthenticated && <LeftSidebar />}

        {/* Main content area with left margin when sidebar is visible */}
        <div className={isAuthenticated ? "ml-64" : ""}>
          <Routes>
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!isAuthenticated ? <Register /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              }
            />
            <Route
              path="/entertainment"
              element={
                <PrivateRoute>
                  <EntertainmentBoard />
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Leaderboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/confess"
              element={
                <PrivateRoute>
                  <ConfessionsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>

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
          theme={isDark ? "dark" : "light"}
        />
      </div>
    </Router>
  );
}

export default App;