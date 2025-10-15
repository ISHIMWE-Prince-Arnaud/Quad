import { useEffect, useState } from 'react';
import { Award, Calendar, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { Post } from '../types';
import PostCard from '../components/PostCard';

const Profile = () => {
  const { user } = useAuthStore();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const res = await api.get(`/posts/user/${user?._id}`);
      setUserPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch user posts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const topPost = userPosts.reduce((max, post) => {
    const total = post.reactions.laugh + post.reactions.cry + post.reactions.love + post.reactions.angry;
    const maxTotal = max ? max.reactions.laugh + max.reactions.cry + max.reactions.love + max.reactions.angry : 0;
    return total > maxTotal ? post : max;
  }, null as Post | null);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-soft p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-32 h-32 rounded-full border-4 border-primary-500"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.username}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.totalPosts || 0}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.totalReactions || 0}</div>
                  <div className="text-sm text-gray-500">Reactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{userPosts.filter(p => p.isTopPost).length}</div>
                  <div className="text-sm text-gray-500">Top Posts</div>
                </div>
              </div>

              {/* Badges */}
              {user.badges && user.badges.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center justify-center md:justify-start space-x-2">
                    <Award size={16} />
                    <span>Badges</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-4 py-2 bg-gradient-to-r from-accent-400 to-primary-500 text-white rounded-full font-semibold text-sm shadow-md"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Post */}
        {topPost && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Award className="text-accent-400" />
              <span>Your Top Post 🏆</span>
            </h2>
            <PostCard post={topPost} />
          </div>
        )}

        {/* User Posts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <ImageIcon className="text-primary-500" />
            <span>Your Posts</span>
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : userPosts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-dark-card rounded-xl shadow-card">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No posts yet. Share your first meme! 🚀
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {userPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
