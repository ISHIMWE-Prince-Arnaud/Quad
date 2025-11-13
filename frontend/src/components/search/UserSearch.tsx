import { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserCard, type UserCardData } from '@/components/user/UserCard';
import { debounce } from '@/lib/utils';
import { SearchService } from '@/services/searchService';
import { FollowService } from '@/services/followService';
import type { ApiProfile } from '@/types/api';

interface UserSearchProps {
  onUserSelect?: (user: UserCardData) => void;
  placeholder?: string;
  showRecentSearches?: boolean;
  compact?: boolean;
  className?: string;
}

// Convert API profile to UserCardData
const convertApiProfileToUserCard = (profile: ApiProfile): UserCardData => ({
  _id: profile._id,
  clerkId: profile.clerkId,
  username: profile.username,
  email: profile.email,
  firstName: profile.firstName,
  lastName: profile.lastName,
  profileImage: profile.profileImage,
  coverImage: profile.coverImage,
  bio: profile.bio,
  isVerified: profile.isVerified,
  followers: profile.followers,
  following: profile.following,
  postsCount: profile.postsCount,
  joinedAt: profile.joinedAt,
  isFollowing: profile.isFollowing,
});

// Real search function using backend API
const searchUsers = async (query: string): Promise<UserCardData[]> => {
  if (!query.trim()) return [];

  try {
    const result = await SearchService.quickUserSearch(query);
    return result.map(convertApiProfileToUserCard);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export function UserSearch({
  onUserSelect,
  placeholder = "Search users...",
  showRecentSearches = true,
  compact = false,
  className = '',
}: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserCardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<UserCardData[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchUsers(searchQuery);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  // Handle search input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  // Handle user selection
  const handleUserSelect = (user: UserCardData) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(u => u._id !== user._id);
      return [user, ...filtered].slice(0, 5); // Keep last 5 searches
    });

    onUserSelect?.(user);
    
    // Clear search if in compact mode
    if (compact) {
      setQuery('');
      setResults([]);
      inputRef.current?.blur();
    }
  };

  // Handle follow/unfollow
  const handleFollow = async (userId: string) => {
    try {
      await FollowService.followUser(userId);
      
      // Update local state
      setResults(prev => prev.map(user => 
        user._id === userId ? { ...user, isFollowing: true } : user
      ));
      setRecentSearches(prev => prev.map(user => 
        user._id === userId ? { ...user, isFollowing: true } : user
      ));
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await FollowService.unfollowUser(userId);
      
      // Update local state
      setResults(prev => prev.map(user => 
        user._id === userId ? { ...user, isFollowing: false } : user
      ));
      setRecentSearches(prev => prev.map(user => 
        user._id === userId ? { ...user, isFollowing: false } : user
      ));
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isFocused && (query.trim() || showRecentSearches);
  const showResults = query.trim() && results.length > 0;
  const showRecent = !query.trim() && showRecentSearches && recentSearches.length > 0;
  const showEmpty = query.trim() && !isLoading && results.length === 0;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showDropdown && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching users...</span>
            </div>
          )}

          {/* Search Results */}
          {showResults && (
            <div>
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">Users</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {results.map((user) => (
                  <div key={user._id} onClick={() => handleUserSelect(user)}>
                    <UserCard
                      user={user}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      compact={true}
                      showBio={false}
                      showStats={false}
                      className="border-0 rounded-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {showRecent && (
            <div>
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">Recent Searches</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {recentSearches.map((user) => (
                  <div key={user._id} onClick={() => handleUserSelect(user)}>
                    <UserCard
                      user={user}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      compact={true}
                      showBio={false}
                      showStats={false}
                      className="border-0 rounded-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {showEmpty && (
            <div className="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground">
              <Users className="h-8 w-8" />
              <p className="text-sm">No users found</p>
              <p className="text-xs">Try searching with different keywords</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
