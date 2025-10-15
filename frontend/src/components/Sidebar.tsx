import { useState, useEffect } from "react";
import { Hash } from "lucide-react";
import api from "../utils/api";

interface Stats {
  activeUsers: number;
  postsToday: number;
  totalReactions: number;
}

interface TrendingTag {
  tag: string;
  count: number;
}

const Sidebar = () => {
  const [stats, setStats] = useState<Stats>({
    activeUsers: 0,
    postsToday: 0,
    totalReactions: 0,
  });
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, tagsRes] = await Promise.all([
          api.get("/stats/community"),
          api.get("/stats/trending-tags"),
        ]);
        setStats(statsRes.data);
        setTrendingTags(tagsRes.data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <aside className="hidden lg:block w-80 card bg-base-200 p-6 sticky top-20 h-fit">
        <div className="animate-pulse">
          <div className="h-4 bg-base-300 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-base-300 rounded"></div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="h-4 bg-base-300 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 bg-base-300 rounded w-1/3"></div>
                  <div className="h-4 bg-base-300 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden lg:block w-80 sticky top-20 h-fit space-y-4">
      {/* Trending Tags */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Trending Tags</h2>
          <div className="space-y-2">
            {trendingTags.map((item) => (
              <button
                key={item.tag}
                className="btn btn-ghost justify-between normal-case w-full">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="opacity-70" />
                  <span>{item.tag}</span>
                </div>
                <span className="badge badge-primary">{item.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-lg mb-4">Community Stats</h3>
          <div className="stats stats-vertical shadow bg-base-100">
            <div className="stat">
              <div className="stat-title">Active Users</div>
              <div className="stat-value text-primary">{stats.activeUsers}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Posts Today</div>
              <div className="stat-value text-primary">{stats.postsToday}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Reactions</div>
              <div className="stat-value text-primary">
                {stats.totalReactions > 1000
                  ? `${(stats.totalReactions / 1000).toFixed(1)}k`
                  : stats.totalReactions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card bg-primary text-primary-content">
        <div className="card-body">
          <h3 className="card-title">Welcome to Quad</h3>
          <p>
            Share your moments, vote on polls, and connect with fellow students.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
