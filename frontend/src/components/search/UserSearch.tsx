import { useState, useEffect, useRef } from 'react';
import { Search, X, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserCard, type UserCardData } from '@/components/user/UserCard';
import { debounce } from '@/lib/utils';

interface UserSearchProps {
  onUserSelect?: (user: UserCardData) => void;
  placeholder?: string;
  showRecentSearches?: boolean;
  compact?: boolean;
  className?: string;
}

// Mock search function - replace with actual API call
const searchUsers = async (query: string): Promise<UserCardData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockUsers: UserCardData[] = [
    {
      _id: '1',
      clerkId: 'user_1',
      username: 'johndoe',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Software engineer passionate about building great products',
      isVerified: true,
      followers: 1234,
      following: 567,
      postsCount: 89,
      joinedAt: '2024-01-15',
      isFollowing: false,
    },
    {
      _id: '2',
      clerkId: 'user_2',
      username: 'janesmith',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
      bio: 'UI/UX Designer creating beautiful digital experiences',
      isVerified: false,
      followers: 892,
      following: 234,
      postsCount: 156,
      joinedAt: '2024-02-20',
      isFollowing: true,
    },
    {
      _id: '3',
      clerkId: 'user_3',
      username: 'alexwilson',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Wilson',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Full-stack developer and tech enthusiast',
      isVerified: true,
      followers: 2341,
      following: 445,
      postsCount: 203,
      joinedAt: '2023-11-10',
      isFollowing: false,
    },
    {
      _id: '4',
      clerkId: 'user_4',
      username: 'sarahbrown',
      email: 'sarah@example.com',
      firstName: 'Sarah',
      lastName: 'Brown',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      bio: 'Digital marketer and content creator',
      isVerified: false,
      followers: 567,
      following: 123,
      postsCount: 78,
      joinedAt: '2024-03-05',
      isFollowing: false,
    },
  ];

  // Filter users based on search query
  if (!query.trim()) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return mockUsers.filter(user => 
    user.username.toLowerCase().includes(lowercaseQuery) ||
    user.firstName?.toLowerCase().includes(lowercaseQuery) ||
    user.lastName?.toLowerCase().includes(lowercaseQuery) ||
    user.email.toLowerCase().includes(lowercaseQuery) ||
    user.bio?.toLowerCase().includes(lowercaseQuery)
  );
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
    // TODO: Implement actual follow API call
    console.log('Following user:', userId);
    
    // Update local state
    setResults(prev => prev.map(user => 
      user._id === userId ? { ...user, isFollowing: true } : user
    ));
    setRecentSearches(prev => prev.map(user => 
      user._id === userId ? { ...user, isFollowing: true } : user
    ));
  };

  const handleUnfollow = async (userId: string) => {
    // TODO: Implement actual unfollow API call
    console.log('Unfollowing user:', userId);
    
    // Update local state
    setResults(prev => prev.map(user => 
      user._id === userId ? { ...user, isFollowing: false } : user
    ));
    setRecentSearches(prev => prev.map(user => 
      user._id === userId ? { ...user, isFollowing: false } : user
    ));
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
