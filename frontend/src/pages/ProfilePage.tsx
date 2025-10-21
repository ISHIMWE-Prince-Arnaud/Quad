import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Post, Poll, Comment as CommentType } from '../types';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostCard from '../components/feed/PostCard';
import PollCard from '../components/polls/PollCard';

interface UserProfile {
  user: {
    id: string;
    username: string;
    email: string;
    profilePicture: string | null;
    createdAt: string;
  };
  posts: Post[];
  polls: Poll[];
  comments: CommentType[];
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'polls' | 'comments'>('posts');

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    try {
      const response = await usersAPI.getUserProfile(username!);
      // Response already contains user, posts, polls, comments structure
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">User not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.user.username;

  return (
    <div className="space-y-6">
      <ProfileHeader
        user={profile.user}
        isOwnProfile={isOwnProfile}
        onProfileUpdate={loadProfile}
      />

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Posts ({profile.posts.length})
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'polls'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Polls ({profile.polls.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-4 py-3 font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Comments ({profile.comments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {profile.posts.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">No posts yet</p>
              ) : (
                profile.posts.map((post) => <PostCard key={post._id} post={post} />)
              )}
            </div>
          )}

          {activeTab === 'polls' && (
            <div className="space-y-6">
              {profile.polls.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">No polls yet</p>
              ) : (
                profile.polls.map((poll) => <PollCard key={poll._id} poll={poll} />)
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {profile.comments.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">No comments yet</p>
              ) : (
                profile.comments.map((comment) => (
                  <div key={comment._id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <p className="text-gray-900 dark:text-white mb-2">{comment.content}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Commented on a post
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
