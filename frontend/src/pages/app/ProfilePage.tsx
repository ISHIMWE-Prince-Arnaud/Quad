import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ProfileTabs, TabContent, type ProfileTab } from '@/components/profile/ProfileTabs'
import { ProfileContentGrid, type ContentItem } from '@/components/profile/ProfileContentGrid'
import { LoadingSpinner } from '@/components/ui/loading'
import { ErrorFallback } from '@/components/layout/ErrorFallback'
import { useAuthStore } from '@/stores/authStore'
import { ComponentErrorBoundary } from '@/components/ui/error-boundary'

// Mock user data - will be replaced with API calls
const mockUser = {
  _id: "user123",
  clerkId: "clerk_user123",
  username: "john_smith",
  email: "john@example.com",
  firstName: "John",
  lastName: "Smith",
  profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop",
  bio: "Product Designer & Developer. Building beautiful experiences for the web. Coffee enthusiast ☕ | Travel lover 🌍",
  location: "San Francisco, CA",
  website: "https://johnsmith.dev",
  joinedAt: "2023-01-15T00:00:00.000Z",
  isVerified: true,
  followers: 1247,
  following: 342,
  postsCount: 89
}

// Mock content data - will be replaced with API calls
const mockContent: ContentItem[] = [
  {
    _id: "post1",
    type: "post",
    content: "Just launched my new portfolio website! Built with React, TypeScript, and Tailwind CSS. Check it out and let me know what you think! 🚀",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
    ],
    author: mockUser,
    createdAt: "2024-11-13T10:30:00.000Z",
    updatedAt: "2024-11-13T10:30:00.000Z",
    likes: 42,
    comments: 8,
    shares: 3,
    isLiked: false
  },
  {
    _id: "story1",
    type: "story",
    title: "My Journey into Web Development",
    content: "From accounting to coding - how I made the career transition that changed my life. A story about taking risks, learning new skills, and finding your passion...",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
    readTime: 5,
    author: mockUser,
    createdAt: "2024-11-12T14:20:00.000Z",
    updatedAt: "2024-11-12T14:20:00.000Z",
    likes: 67,
    comments: 12
  },
  {
    _id: "poll1",
    type: "poll",
    question: "What's your favorite JavaScript framework for 2024?",
    options: [
      { id: "react", text: "React", votes: 145 },
      { id: "vue", text: "Vue.js", votes: 87 },
      { id: "angular", text: "Angular", votes: 43 },
      { id: "svelte", text: "Svelte", votes: 76 }
    ],
    totalVotes: 351,
    endsAt: "2024-11-20T23:59:59.000Z",
    hasVoted: true,
    author: mockUser,
    createdAt: "2024-11-10T09:15:00.000Z",
    updatedAt: "2024-11-13T09:15:00.000Z",
    likes: 23,
    comments: 15
  },
  {
    _id: "post2",
    type: "post",
    content: "Beautiful sunset from my morning hike today. Nature never fails to inspire me 🌅",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=800&fit=crop"
    ],
    author: mockUser,
    createdAt: "2024-11-11T07:45:00.000Z",
    updatedAt: "2024-11-11T07:45:00.000Z",
    likes: 156,
    comments: 24,
    shares: 12,
    isLiked: true
  }
]

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { user: currentUser } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts')
  const [user, setUser] = useState(mockUser)
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.username === username

  // Filter content based on active tab
  const filteredContent = content.filter(item => {
    switch (activeTab) {
      case 'posts':
        return item.type === 'post'
      case 'stories':
        return item.type === 'story'
      case 'polls':
        return item.type === 'poll'
      case 'saved':
        // TODO: Filter saved content when implemented
        return false
      case 'liked':
        // TODO: Filter liked content when implemented
        return false
      default:
        return false
    }
  })

  // Get content counts
  const postCount = content.filter(item => item.type === 'post').length
  const storyCount = content.filter(item => item.type === 'story').length
  const pollCount = content.filter(item => item.type === 'poll').length

  // Simulate API calls
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        // TODO: Replace with actual API calls
        // const userResponse = await fetch(`/api/profile/${username}`)
        // const contentResponse = await fetch(`/api/profile/${username}/${activeTab}`)
        
        setUser(mockUser)
        setContent(mockContent)
        setIsFollowing(false) // TODO: Get from API
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfileData()
    }
  }, [username])

  // Handle follow/unfollow
  const handleFollow = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/follow/${user._id}`, { method: 'POST' })
      setIsFollowing(true)
      setUser(prev => ({ ...prev, followers: (prev.followers || 0) + 1 }))
    } catch (err) {
      console.error('Failed to follow user:', err)
    }
  }

  const handleUnfollow = async () => {
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/follow/${user._id}`, { method: 'DELETE' })
      setIsFollowing(false)
      setUser(prev => ({ ...prev, followers: Math.max((prev.followers || 0) - 1, 0) }))
    } catch (err) {
      console.error('Failed to unfollow user:', err)
    }
  }

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile page
    console.log('Edit profile clicked')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorFallback
        title="Profile Not Found"
        description={error}
        resetErrorBoundary={() => window.location.reload()}
      />
    )
  }

  return (
    <ComponentErrorBoundary componentName="ProfilePage">
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="px-4 py-6">
            <ProfileHeader
              user={user}
              isOwnProfile={isOwnProfile}
              isFollowing={isFollowing}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onEditProfile={handleEditProfile}
            />
          </div>

          {/* Profile Navigation Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            postCount={postCount}
            storyCount={storyCount}
            pollCount={pollCount}
            isOwnProfile={isOwnProfile}
          />

          {/* Profile Content */}
          <TabContent>
            <ProfileContentGrid
              items={filteredContent}
              loading={loading}
              hasMore={false} // TODO: Implement pagination
              onLoadMore={() => {
                // TODO: Load more content
                console.log('Load more content')
              }}
            />
          </TabContent>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
