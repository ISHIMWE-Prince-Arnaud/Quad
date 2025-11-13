import { useState, useEffect, useCallback } from 'react';
import { X, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCard, type UserCardData } from '@/components/user/UserCard';
import { FollowService } from '@/services/followService';
import type { ApiFollowUser } from '@/types/api';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  initialCount?: number;
}

// Convert API follow user to UserCardData
const convertApiFollowUserToUserCard = (followUser: ApiFollowUser): UserCardData => ({
  _id: followUser._id,
  clerkId: followUser.clerkId,
  username: followUser.username,
  email: '', // Not provided in follow lists
  firstName: followUser.firstName,
  lastName: followUser.lastName,
  profileImage: followUser.profileImage,
  bio: followUser.bio,
  isVerified: followUser.isVerified,
  followers: 0, // Not provided in follow lists
  following: 0, // Not provided in follow lists
  postsCount: 0, // Not provided in follow lists
  joinedAt: followUser.followedAt || new Date().toISOString(),
  isFollowing: followUser.isFollowing,
});

// Real API functions using backend endpoints
const getFollowers = async (userId: string): Promise<UserCardData[]> => {
  try {
    const result = await FollowService.getFollowers(userId, { limit: 50 });
    return result.followers.map(convertApiFollowUserToUserCard);
  } catch (error) {
    console.error('Failed to load followers:', error);
    return [];
  }
};

const getFollowing = async (userId: string): Promise<UserCardData[]> => {
  try {
    const result = await FollowService.getFollowing(userId, { limit: 50 });
    return result.following.map(convertApiFollowUserToUserCard);
  } catch (error) {
    console.error('Failed to load following:', error);
    return [];
  }
};

export function FollowersModal({
  isOpen,
  onClose,
  userId,
  type,
  initialCount = 0,
}: FollowersModalProps) {
  const [users, setUsers] = useState<UserCardData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = type === 'followers'
        ? await getFollowers(userId)
        : await getFollowing(userId);
      setUsers(data);
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, type]);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, loadUsers]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query) ||
        user.bio?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Handle follow/unfollow
  const handleFollow = async (targetUserId: string) => {
    try {
      await FollowService.followUser(targetUserId);
      
      setUsers(prev => prev.map(user => 
        user._id === targetUserId ? { ...user, isFollowing: true } : user
      ));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      await FollowService.unfollowUser(targetUserId);
      
      setUsers(prev => prev.map(user => 
        user._id === targetUserId ? { ...user, isFollowing: false } : user
      ));
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  if (!isOpen) return null;

  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-background rounded-lg shadow-lg max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${type}...`}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                    </div>
                    <div className="h-8 w-16 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onFollow={handleFollow}
                  onUnfollow={handleUnfollow}
                  compact={true}
                  showBio={true}
                  showStats={false}
                  className="border-0 rounded-none hover:bg-accent/50"
                />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
              <Search className="h-8 w-8" />
              <div className="text-center">
                <p className="font-medium">No results found</p>
                <p className="text-sm">Try searching with different keywords</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground">
              <Users className="h-8 w-8" />
              <div className="text-center">
                <p className="font-medium">No {type} yet</p>
                <p className="text-sm">
                  {type === 'followers' 
                    ? 'When people follow this user, they will appear here'
                    : 'When this user follows people, they will appear here'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with count */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="p-4 border-t bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery 
                ? `${filteredUsers.length} ${type} matching "${searchQuery}"`
                : `${filteredUsers.length} of ${initialCount || filteredUsers.length} ${type}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
