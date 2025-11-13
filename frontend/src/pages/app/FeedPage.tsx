import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react'
import { ComponentErrorBoundary } from '@/components/ui/error-boundary'

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    author: {
      name: 'John Doe',
      username: 'johndoe',
      avatar: '',
      isVerified: true
    },
    content: 'Just launched my new React app! 🚀 It\'s amazing what you can build with modern tools. The development experience has never been better.',
    timestamp: '2 hours ago',
    likes: 42,
    comments: 8,
    shares: 3
  },
  {
    id: 2,
    author: {
      name: 'Sarah Wilson',
      username: 'sarahw',
      avatar: '',
      isVerified: false
    },
    content: 'Beautiful sunset today! Sometimes it\'s important to take a break from coding and appreciate the simple things in life. 🌅',
    timestamp: '4 hours ago',
    likes: 127,
    comments: 23,
    shares: 12
  },
  {
    id: 3,
    author: {
      name: 'Tech Insider',
      username: 'techinsider',
      avatar: '',
      isVerified: true
    },
    content: 'Breaking: New JavaScript framework announced! This could be a game-changer for web development. What are your thoughts?',
    timestamp: '6 hours ago',
    likes: 89,
    comments: 45,
    shares: 28
  }
]

function PostCard({ post }: { post: typeof mockPosts[0] }) {
  return (
    <ComponentErrorBoundary componentName="PostCard">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-semibold text-sm">{post.author.name}</h3>
                  {post.author.isVerified && (
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{post.author.username} • {post.timestamp}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm mb-4 leading-relaxed">{post.content}</p>
          
          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500">
              <Heart className="h-4 w-4" />
              <span className="text-xs">{post.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-blue-500">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.comments}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-green-500">
              <Share className="h-4 w-4" />
              <span className="text-xs">{post.shares}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </ComponentErrorBoundary>
  )
}

export default function FeedPage() {
  return (
    <ComponentErrorBoundary componentName="FeedPage">
      <div className="max-w-2xl mx-auto">
        {/* Create Post Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-muted-foreground hover:bg-accent transition-colors cursor-text flex items-center">
                  What's on your mind?
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-border">
              <Button size="sm" className="gap-2">
                Create Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        <div>
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <Button variant="outline" size="lg">
            Load More Posts
          </Button>
        </div>
      </div>
    </ComponentErrorBoundary>
  )
}
