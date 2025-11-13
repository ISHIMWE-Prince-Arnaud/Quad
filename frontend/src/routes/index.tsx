import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RootLayout } from '../layouts/RootLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'

// Pages
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import SignUpPage from '../pages/auth/SignUpPage'
import FeedPage from '../pages/FeedPage'
import ProfilePage from '../pages/ProfilePage'
import EditProfilePage from '../pages/EditProfilePage'
import PostPage from '../pages/PostPage'
import CreatePostPage from '../pages/CreatePostPage'
import StoriesPage from '../pages/StoriesPage'
import StoryPage from '../pages/StoryPage'
import CreateStoryPage from '../pages/CreateStoryPage'
import PollsPage from '../pages/PollsPage'
import PollPage from '../pages/PollPage'
import CreatePollPage from '../pages/CreatePollPage'
import ChatPage from '../pages/ChatPage'
import SearchPage from '../pages/SearchPage'
import NotificationsPage from '../pages/NotificationsPage'
import SettingsPage from '../pages/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public routes
      {
        path: '',
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'login/*',
            element: <LoginPage />,
          },
          {
            path: 'signup/*',
            element: <SignUpPage />,
          },
        ],
      },
      // Protected routes
      {
        path: 'app',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/app/feed" replace />,
          },
          {
            path: 'feed',
            element: <FeedPage />,
          },
          {
            path: 'profile/:username',
            element: <ProfilePage />,
          },
          {
            path: 'profile/:username/edit',
            element: <EditProfilePage />,
          },
          {
            path: 'posts/:id',
            element: <PostPage />,
          },
          {
            path: 'create/post',
            element: <CreatePostPage />,
          },
          {
            path: 'stories',
            element: <StoriesPage />,
          },
          {
            path: 'stories/:id',
            element: <StoryPage />,
          },
          {
            path: 'create/story',
            element: <CreateStoryPage />,
          },
          {
            path: 'polls',
            element: <PollsPage />,
          },
          {
            path: 'polls/:id',
            element: <PollPage />,
          },
          {
            path: 'create/poll',
            element: <CreatePollPage />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
          },
          {
            path: 'chat/:conversationId',
            element: <ChatPage />,
          },
          {
            path: 'search',
            element: <SearchPage />,
          },
          {
            path: 'notifications',
            element: <NotificationsPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
