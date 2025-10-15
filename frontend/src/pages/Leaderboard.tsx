import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Award, Flame } from 'lucide-react';
import api from '../utils/api';
import { Leaderboard as LeaderboardType } from '../types';

const Leaderboard = () => {
  const [data, setData] = useState<LeaderboardType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-3">
            <Trophy className="text-accent" size={40} />
            <span>Leaderboard</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See who's dominating the Quad this week!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Funniest Posts */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Flame className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Top 5 Funniest 😂
              </h2>
            </div>
            <div className="space-y-3">
              {data?.topFunny.map((post, index) => (
                <div key={post._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:scale-105 transition-transform">
                  <div className={`text-2xl font-bold ${index === 0 ? 'text-accent' : 'text-gray-400'}`}>
                    #{index + 1}
                  </div>
                  <img src={post.mediaUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {post.caption}
                    </p>
                    <p className="text-sm text-gray-500">by {post.user.username}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-500">😂 {post.reactions.laugh}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Active Users */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="text-primary" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Most Active Users 🔥
              </h2>
            </div>
            <div className="space-y-3">
              {data?.activeUsers.map((user, index) => (
                <div key={user._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`text-2xl font-bold ${index < 3 ? 'text-primary' : 'text-gray-400'}`}>
                    #{index + 1}
                  </div>
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.totalPosts} posts</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{user.totalReactions}</div>
                    <div className="text-xs text-gray-500">reactions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Reacted Posts */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="text-purple-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Most Reacted Posts ❤️
              </h2>
            </div>
            <div className="space-y-3">
              {data?.topReacted.map((post, index) => (
                <div key={post._id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`text-2xl font-bold ${index === 0 ? 'text-purple-500' : 'text-gray-400'}`}>
                    #{index + 1}
                  </div>
                  <img src={post.mediaUrl} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {post.caption}
                    </p>
                    <p className="text-sm text-gray-500">by {post.user.username}</p>
                  </div>
                  <div className="text-xl font-bold text-purple-500">
                    {post.totalReactions}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hall of Fame */}
          <div className="bg-gradient-to-br from-accent/20 to-primary/20 dark:from-accent/10 dark:to-primary/10 rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="text-accent" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Hall of Fame 🏆
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Legends with special badges
            </p>
            <div className="space-y-3">
              {data?.hallOfFame.map((user) => (
                <div key={user._id} className="flex items-center space-x-4 p-4 bg-white/50 dark:bg-dark-card/50 backdrop-blur-sm rounded-lg">
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full border-2 border-accent" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.badges?.map((badge) => (
                        <span
                          key={badge}
                          className="text-xs px-2 py-1 bg-accent text-gray-900 rounded-full font-medium"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
