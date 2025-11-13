import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCard, type UserCardData } from '@/components/user/UserCard';

interface WhoToFollowProps {
  limit?: number;
  showRefresh?: boolean;
  compact?: boolean;
  className?: string;
}

// Mock function to get user suggestions - replace with actual API call
const getUserSuggestions = async (limit: number = 3): Promise<UserCardData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allUsers: UserCardData[] = [
    {
      _id: '1',
      clerkId: 'user_1',
      username: 'techguru2024',
      email: 'tech@example.com',
      firstName: 'David',
      lastName: 'Chen',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Senior Software Engineer at TechCorp. Passionate about AI and machine learning.',
      isVerified: true,
      followers: 3456,
      following: 234,
      postsCount: 127,
      joinedAt: '2023-08-15',
      isFollowing: false,
    },
    {
      _id: '2',
      clerkId: 'user_2',
      username: 'designpro',
      email: 'design@example.com',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&h=400&fit=crop',
      bio: 'UI/UX Designer creating beautiful and functional digital experiences',
      isVerified: false,
      followers: 1892,
      following: 445,
      postsCount: 89,
      joinedAt: '2023-12-03',
      isFollowing: false,
    },
    {
      _id: '3',
      clerkId: 'user_3',
      username: 'startup_founder',
      email: 'founder@example.com',
      firstName: 'Michael',
      lastName: 'Johnson',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Entrepreneur | Building the future of fintech | Angel investor',
      isVerified: true,
      followers: 8923,
      following: 567,
      postsCount: 203,
      joinedAt: '2023-06-20',
      isFollowing: false,
    },
    {
      _id: '4',
      clerkId: 'user_4',
      username: 'creativecoder',
      email: 'creative@example.com',
      firstName: 'Sophia',
      lastName: 'Wilson',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer with a passion for creative coding and interactive art',
      isVerified: false,
      followers: 2134,
      following: 123,
      postsCount: 156,
      joinedAt: '2024-01-10',
      isFollowing: false,
    },
    {
      _id: '5',
      clerkId: 'user_5',
      username: 'datascientist',
      email: 'data@example.com',
      firstName: 'Alex',
      lastName: 'Kumar',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      bio: 'Data Scientist | ML Engineer | Making sense of complex data patterns',
      isVerified: false,
      followers: 1567,
      following: 289,
      postsCount: 94,
      joinedAt: '2023-09-14',
      isFollowing: false,
    },
    {
      _id: '6',
      clerkId: 'user_6',
      username: 'productmanager',
      email: 'product@example.com',
      firstName: 'Rachel',
      lastName: 'Thompson',
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      coverImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=400&fit=crop',
      bio: 'Senior Product Manager | Building products that users love',
      isVerified: true,
      followers: 4321,
      following: 678,
      postsCount: 178,
      joinedAt: '2023-07-08',
      isFollowing: false,
    },
  ];

  // Shuffle and return limited number of users
  const shuffled = allUsers.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
};

export function WhoToFollow({
  limit = 3,
  showRefresh = true,
  compact = false,
  className = '',
}: WhoToFollowProps) {
  const [suggestions, setSuggestions] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const users = await getUserSuggestions(limit);
      setSuggestions(users);
    } catch (error) {
      console.error('Failed to load user suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Load initial suggestions
  useEffect(() => {
    loadSuggestions();
  }, [limit, loadSuggestions]);

  const refreshSuggestions = async () => {
    setIsRefreshing(true);
    try {
      const users = await getUserSuggestions(limit);
      setSuggestions(users);
    } catch (error) {
      console.error('Failed to refresh suggestions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle follow/unfollow
  const handleFollow = async (userId: string) => {
    // TODO: Implement actual follow API call
    console.log('Following user:', userId);
    
    // Update local state
    setSuggestions(prev => prev.map(user => 
      user._id === userId ? { ...user, isFollowing: true, followers: (user.followers || 0) + 1 } : user
    ));
  };

  const handleUnfollow = async (userId: string) => {
    // TODO: Implement actual unfollow API call  
    console.log('Unfollowing user:', userId);
    
    // Update local state
    setSuggestions(prev => prev.map(user => 
      user._id === userId ? { ...user, isFollowing: false, followers: Math.max((user.followers || 1) - 1, 0) } : user
    ));
  };

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Who to follow</h3>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSuggestions}
              disabled={isRefreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-2 bg-muted rounded w-2/3 animate-pulse" />
                </div>
                <div className="h-6 w-12 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-1">
            {suggestions.map((user) => (
              <UserCard
                key={user._id}
                user={user}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                compact={true}
                showBio={false}
                showStats={false}
                className="hover:bg-accent/50"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            <Users className="h-6 w-6" />
            <p className="text-xs">No suggestions available</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Who to follow</CardTitle>
          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshSuggestions}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map((user, index) => (
              <div key={user._id}>
                <UserCard
                  user={user}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  compact={true}
                  showBio={true}
                  showStats={false}
                  className="border-0 shadow-none hover:bg-accent/50 transition-colors"
                />
                {index < suggestions.length - 1 && (
                  <div className="border-t mt-3" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
            <Users className="h-8 w-8" />
            <div className="text-center">
              <p className="font-medium">No suggestions available</p>
              <p className="text-sm">Check back later for new recommendations</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
