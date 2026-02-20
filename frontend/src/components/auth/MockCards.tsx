import { PostCard } from "@/components/posts/PostCard";
import { PollCard } from "@/components/polls/PollCard";
import { StoryCard } from "@/components/stories/StoryCard";
import { NotificationRow } from "@/pages/notifications/NotificationRow";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import type { Post } from "@/types/post";
import type { Poll } from "@/types/poll";
import type { Story } from "@/types/story";
import type { ApiNotification } from "@/types/api";

const ISO_2H_AGO = "2026-02-13T13:00:00.000Z";
const ISO_1H_AGO = "2026-02-13T14:00:00.000Z";
const ISO_5H_AGO = "2026-02-13T10:00:00.000Z";
const ISO_2M_AGO = "2026-02-13T14:58:00.000Z";
const ISO_250D_AGO = "2025-06-08T12:00:00.000Z";

// --- Product-identical cards for auth preview (reuse in-app components) ---
export const MockPostCard = () => {
  const post: Post = {
    _id: "auth-preview-post",
    userId: "auth-preview-user",
    author: {
      clerkId: "auth-preview-user",
      username: "johndoe",
      email: "johndoe@quad.test",
      profileImage: undefined,
    },
    text: "Just shipped a small UI upgrade. Tag someone who cares about clean UX: @alice_dev",
    media: [
      {
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=80",
        type: "image",
        aspectRatio: "16:9",
      },
    ],
    reactionsCount: 128,
    commentsCount: 24,
    createdAt: ISO_2H_AGO,
    updatedAt: ISO_2H_AGO,
  };

  return <PostCard post={post} />;
};

// --- Mock Poll Card ---
export const MockPollCard = () => {
  const poll: Poll = {
    id: "auth-preview-poll",
    author: {
      _id: "auth-preview-user",
      clerkId: "auth-preview-user",
      username: "johndoe",
      email: "johndoe@quad.test",
      profileImage: undefined,
      bio: "Product / UI",
      joinedAt: ISO_250D_AGO,
      updatedAt: ISO_1H_AGO,
      createdAt: ISO_250D_AGO,
    },
    question: "Which Quad feature should we polish next?",
    options: [
      { index: 0, text: "Feed", votesCount: 540, percentage: 45 },
      { index: 1, text: "Chat", votesCount: 360, percentage: 30 },
      { index: 2, text: "Stories", votesCount: 300, percentage: 25 },
    ],
    settings: {
      anonymousVoting: false,
    },
    totalVotes: 1200,
    reactionsCount: 84,
    userVote: [0],
    canViewResults: true,
    status: "active",
    createdAt: ISO_1H_AGO,
    updatedAt: ISO_1H_AGO,
  };

  return <PollCard poll={poll} />;
};

// --- Mock Story Card ---
export const MockStoryCard = () => {
  const story: Story = {
    _id: "auth-preview-story",
    author: {
      clerkId: "auth-preview-user",
      username: "alice_dev",
      email: "alice@quad.test",
      profileImage: undefined,
    },
    title: "Redefining digital connection",
    content:
      "<p>Quad keeps things fast, calm, and structured — so your community can actually move.</p>",
    coverImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    status: "published",
    readTime: 5,
    reactionsCount: 54,
    commentsCount: 12,
    createdAt: ISO_5H_AGO,
    updatedAt: ISO_5H_AGO,
  };

  return <StoryCard story={story} />;
};

// --- Mock Chat Card ---
// Chat page is a full-screen experience; for auth preview we reuse the in-app message styling.
// We keep this as a lightweight, static representation for now.
export const MockChatCard = () => {
  const notification: ApiNotification = {
    id: "auth-preview-chat",
    userId: "auth-preview-user",
    type: "chat_message",
    message: "New message from @sarah: The new UI is insane!",
    isRead: false,
    createdAt: ISO_2M_AGO,
    actor: {
      clerkId: "auth-preview-actor",
      username: "sarah",
      displayName: "Sarah",
      profileImage: undefined,
    },
    contentType: "chat",
    contentId: "general",
  };

  return (
    <div className="w-full">
      <NotificationRow
        notification={notification}
        onNavigate={() => {}}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};

// --- Mock Notification Card ---
export const MockNotificationCard = () => {
  const notification: ApiNotification = {
    id: "auth-preview-notification",
    userId: "auth-preview-user",
    type: "follow",
    message: "followed you",
    isRead: false,
    createdAt: ISO_2M_AGO,
    actor: {
      clerkId: "auth-preview-actor-2",
      username: "alex_king",
      displayName: "Alex King",
      profileImage: undefined,
    },
    contentType: "user",
    contentId: "alex_king",
  };

  return (
    <div className="w-full">
      <NotificationRow
        notification={notification}
        onNavigate={() => {}}
        onMarkAsRead={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};

// --- Mock Profile Card ---
export const MockProfileCard = () => {
  const user = {
    clerkId: "auth-preview-user",
    username: "QuadHQ",
    displayName: "Quad Official",
    profileImage: undefined,
    bio: "Empowering student communities through structured collaboration and expression.",
    followersCount: 1200,
    followingCount: 420,
    postsCount: 84,
    createdAt: ISO_250D_AGO,
  };

  return (
    <ProfileHeader
      user={user as never}
      isOwnProfile
      isFollowing={false}
      activeTab="posts"
      onTabChange={() => {}}
      tabCounts={{ posts: 84, stories: 12, polls: 6 } as never}
      onFollow={() => {}}
      onUnfollow={() => {}}
      onEditProfile={() => {}}
      onUserUpdate={() => {}}
    />
  );
};
