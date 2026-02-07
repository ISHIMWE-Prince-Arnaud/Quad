import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RootLayout } from "@/layouts/RootLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { LazyRoute } from "./LazyRoute";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage"));
const FeedPage = lazy(() => import("@/pages/app/FeedPage"));
const ProfilePage = lazy(() => import("@/pages/app/ProfilePage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const EditPostPage = lazy(() => import("@/pages/EditPostPage"));
const PostPage = lazy(() => import("@/pages/app/PostPage"));
const CreatePostPage = lazy(() => import("@/pages/CreatePostPage"));
const StoriesPage = lazy(() => import("@/pages/StoriesPage"));
const StoryPage = lazy(() => import("@/pages/StoryPage"));
const CreateStoryPage = lazy(() => import("@/pages/CreateStoryPage"));
const EditStoryPage = lazy(() => import("@/pages/EditStoryPage"));
const PollsPage = lazy(() => import("@/pages/PollsPage"));
const CreatePollPage = lazy(() => import("@/pages/CreatePollPage"));
const EditPollPage = lazy(() => import("@/pages/EditPollPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Public routes
      {
        path: "",
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: (
              <LazyRoute>
                <HomePage />
              </LazyRoute>
            ),
          },
          {
            path: "login/*",
            element: (
              <LazyRoute>
                <LoginPage />
              </LazyRoute>
            ),
          },
          {
            path: "signup/*",
            element: (
              <LazyRoute>
                <SignUpPage />
              </LazyRoute>
            ),
          },
        ],
      },
      // Protected routes
      {
        path: "app",
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
            path: "feed",
            element: (
              <LazyRoute>
                <FeedPage />
              </LazyRoute>
            ),
          },
          {
            path: "profile/:username",
            element: (
              <LazyRoute>
                <ProfilePage />
              </LazyRoute>
            ),
          },
          {
            path: "profile/:username/edit",
            element: (
              <LazyRoute>
                <EditProfilePage />
              </LazyRoute>
            ),
          },
          {
            path: "posts/:id",
            element: (
              <LazyRoute>
                <PostPage />
              </LazyRoute>
            ),
          },
          {
            path: "posts/:id/edit",
            element: (
              <LazyRoute>
                <EditPostPage />
              </LazyRoute>
            ),
          },
          {
            path: "create/post",
            element: (
              <LazyRoute>
                <CreatePostPage />
              </LazyRoute>
            ),
          },
          {
            path: "stories",
            element: (
              <LazyRoute>
                <StoriesPage />
              </LazyRoute>
            ),
          },
          {
            path: "stories/:id",
            element: (
              <LazyRoute>
                <StoryPage />
              </LazyRoute>
            ),
          },
          {
            path: "stories/:id/edit",
            element: (
              <LazyRoute>
                <EditStoryPage />
              </LazyRoute>
            ),
          },
          {
            path: "create/story",
            element: (
              <LazyRoute>
                <CreateStoryPage />
              </LazyRoute>
            ),
          },
          {
            path: "polls",
            element: (
              <LazyRoute>
                <PollsPage />
              </LazyRoute>
            ),
          },
          {
            path: "polls/:id/edit",
            element: (
              <LazyRoute>
                <EditPollPage />
              </LazyRoute>
            ),
          },
          {
            path: "create/poll",
            element: (
              <LazyRoute>
                <CreatePollPage />
              </LazyRoute>
            ),
          },
          {
            path: "chat",
            element: (
              <LazyRoute>
                <ChatPage />
              </LazyRoute>
            ),
          },
          {
            path: "notifications",
            element: (
              <LazyRoute>
                <NotificationsPage />
              </LazyRoute>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: (
      <LazyRoute>
        <NotFoundPage />
      </LazyRoute>
    ),
  },
]);
