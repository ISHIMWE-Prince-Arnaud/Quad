import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share, MoreHorizontal, Play } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// Types for different content types
export interface BaseContent {
  _id: string
  createdAt: string
  updatedAt: string
  likes: number
  comments: number
  shares?: number
  isLiked?: boolean
}

export interface PostContent extends BaseContent {
  type: 'post'
  content: string
  images?: string[]
  author: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    profileImage?: string
  }
}

export interface StoryContent extends BaseContent {
  type: 'story'
  title: string
  content: string
  coverImage?: string
  readTime?: number
  author: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    profileImage?: string
  }
}

export interface PollContent extends BaseContent {
  type: 'poll'
  question: string
  options: Array<{
    id: string
    text: string
    votes: number
  }>
  totalVotes: number
  endsAt?: string
  hasVoted?: boolean
  author: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    profileImage?: string
  }
}

export type ContentItem = PostContent | StoryContent | PollContent

interface ProfileContentGridProps {
  items: ContentItem[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  className?: string
}

export function ProfileContentGrid({
  items,
  loading = false,
  onLoadMore,
  hasMore = false,
  className
}: ProfileContentGridProps) {
  const [columns, setColumns] = useState(1)

  // Responsive column calculation
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width >= 1280) setColumns(3)      // xl
      else if (width >= 768) setColumns(2)  // md
      else setColumns(1)                    // sm
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  // Distribute items into columns for masonry layout
  const distributeItems = (items: ContentItem[], columnCount: number) => {
    const columns: ContentItem[][] = Array.from({ length: columnCount }, () => [])
    
    items.forEach((item, index) => {
      const columnIndex = index % columnCount
      columns[columnIndex].push(item)
    })
    
    return columns
  }

  const itemColumns = distributeItems(items, columns)

  if (loading && items.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-lg" />
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="text-muted-foreground">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-medium mb-2">No content yet</h3>
          <p className="text-sm">When content is created, it will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Masonry Grid */}
      <div className={cn(
        "grid gap-4",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3"
      )}>
        {itemColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {column.map((item) => (
              <ContentCard key={item._id} item={item} />
            ))}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="min-w-[120px]"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  )
}

// Individual content card component
function ContentCard({ item }: { item: ContentItem }) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const authorName = item.author.firstName && item.author.lastName
    ? `${item.author.firstName} ${item.author.lastName}`
    : item.author.firstName || item.author.username

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: new Date(dateString).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const renderContent = () => {
    switch (item.type) {
      case 'post':
        return (
          <div className="space-y-3">
            <p className={cn(
              "text-sm text-foreground leading-relaxed",
              !isExpanded && item.content.length > 150 && "line-clamp-3"
            )}>
              {item.content}
            </p>
            {item.content.length > 150 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-auto p-0 text-primary hover:bg-transparent"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
            {item.images && item.images.length > 0 && (
              <div className={cn(
                "grid gap-2 rounded-lg overflow-hidden",
                item.images.length === 1 && "grid-cols-1",
                item.images.length === 2 && "grid-cols-2",
                item.images.length > 2 && "grid-cols-2"
              )}>
                {item.images.slice(0, 4).map((image, idx) => (
                  <div key={idx} className="relative aspect-square bg-muted">
                    <img
                      src={image}
                      alt={`Post image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 3 && item.images!.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-medium">
                          +{item.images!.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      case 'story':
        return (
          <div className="space-y-3">
            {item.coverImage && (
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.content}
            </p>
            {item.readTime && (
              <span className="text-xs text-muted-foreground">
                {item.readTime} min read
              </span>
            )}
          </div>
        )
      
      case 'poll': {
        const isActive = item.endsAt ? new Date(item.endsAt) > new Date() : true
        
        return (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">{item.question}</h3>
            <div className="space-y-2">
              {item.options.map((option) => {
                const percentage = item.totalVotes > 0 
                  ? Math.round((option.votes / item.totalVotes) * 100)
                  : 0
                
                return (
                  <div key={option.id} className="relative">
                    <div className={cn(
                      "p-3 rounded-lg border text-sm transition-colors",
                      item.hasVoted && !isActive
                        ? "bg-muted cursor-default"
                        : "hover:bg-accent cursor-pointer"
                    )}>
                      <div className="flex justify-between items-center">
                        <span>{option.text}</span>
                        {item.hasVoted && (
                          <span className="text-xs text-muted-foreground">
                            {percentage}%
                          </span>
                        )}
                      </div>
                      {item.hasVoted && (
                        <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 animate-pulse" 
                             style={{ width: `${percentage}%`, opacity: 0.2 }} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.totalVotes} votes</span>
              {item.endsAt && (
                <span>
                  {isActive ? 'Ends' : 'Ended'} {formatDate(item.endsAt)}
                </span>
              )}
            </div>
          </div>
        )
      }
      
      default:
        return null
    }
  }

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 cursor-pointer">
      <CardContent className="p-4">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.author.profileImage} />
              <AvatarFallback className="text-xs">
                {authorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">{authorName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className={cn(
              "h-auto p-0 text-muted-foreground hover:text-red-500",
              item.isLiked && "text-red-500"
            )}>
              <Heart className={cn("h-4 w-4 mr-1", item.isLiked && "fill-current")} />
              <span className="text-xs">{item.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{item.comments}</span>
            </Button>
            {item.shares !== undefined && (
              <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-primary">
                <Share className="h-4 w-4 mr-1" />
                <span className="text-xs">{item.shares}</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
