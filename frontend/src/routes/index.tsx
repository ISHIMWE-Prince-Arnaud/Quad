import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RootLayout } from "@/layouts/RootLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import {
  LoginSkeleton,
  SignUpSkeleton,
  CallbackSkeleton,
} from "@/components/auth/AuthSkeletons";
import { LazyRoute } from "./LazyRoute";

// Lazy load pages for code splitting
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignUpPage = lazy(() => import("@/pages/auth/SignUpPage"));
const SsoCallbackPage = lazy(() => import("@/pages/auth/SsoCallbackPage"));
const FeedPage = lazy(() => import("@/pages/app/FeedPage"));
const ProfilePage = lazy(() => import("@/pages/app/ProfilePage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const EditPostPage = lazy(() => import("@/pages/EditPostPage"));
const PostPage = lazy(() => import("@/pages/app/PostPage"));
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
      // 1. Auth / Public Routes (Explicit paths)
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login/sso-callback",
            element: (
              <LazyRoute
                fallback={
                  <AuthSplitLayout variant="login">
                    <CallbackSkeleton />
                  </AuthSplitLayout>
                }>
                <SsoCallbackPage />
              </LazyRoute>
            ),
          },
          {
            path: "signup/sso-callback",
            element: (
              <LazyRoute
                fallback={
                  <AuthSplitLayout variant="signup">
                    <CallbackSkeleton />
                  </AuthSplitLayout>
                }>
                <SsoCallbackPage />
              </LazyRoute>
            ),
          },
          {
            path: "login/*",
            element: (
              <LazyRoute
                fallback={
                  <AuthSplitLayout variant="login">
                    <LoginSkeleton />
                  </AuthSplitLayout>
                }>
                <LoginPage />
              </LazyRoute>
            ),
          },
          {
            path: "signup/*",
            element: (
              <LazyRoute
                fallback={
                  <AuthSplitLayout variant="signup">
                    <SignUpSkeleton />
                  </AuthSplitLayout>
                }>
                <SignUpPage />
              </LazyRoute>
            ),
          },
        ],
      },
      // 2. Protected Routes (Root level + empty path)
      {
        path: "",
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <LazyRoute>
                <FeedPage />
              </LazyRoute>
            ),
          },
          {
            path: "feed",
            element: <Navigate to="/" replace />, // Redirect /feed to /
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
            path: "chat/:id",
            element: <Navigate to="/chat" replace />,
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
      // 3. Legacy Redirects
      {
        path: "app/*",
        element: <Navigate to="/" replace />,
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
