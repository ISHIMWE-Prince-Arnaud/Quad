import { Link } from 'react-router-dom'
import { TrendingUp, Users, Calendar, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock data - replace with real data
const trendingTopics = [
  { tag: 'TechTalk', posts: 2549, isGrowing: true },
  { tag: 'WebDev', posts: 1876, isGrowing: true },
  { tag: 'AI', posts: 3421, isGrowing: false },
  { tag: 'React', posts: 1234, isGrowing: true },
  { tag: 'JavaScript', posts: 987, isGrowing: false },
]

const suggestedUsers = [
  { id: 1, name: 'Sarah Chen', username: 'sarahc', avatar: '', isVerified: true },
  { id: 2, name: 'Alex Johnson', username: 'alexj', avatar: '', isVerified: false },
  { id: 3, name: 'Maria Garcia', username: 'mariag', avatar: '', isVerified: true },
]

const upcomingEvents = [
  { id: 1, title: 'Tech Meetup', date: 'Nov 15', participants: 45 },
  { id: 2, title: 'Design Workshop', date: 'Nov 18', participants: 23 },
  { id: 3, title: 'Hackathon 2024', date: 'Nov 22', participants: 156 },
]

export function RightPanel() {
  return (
    <div className="h-full overflow-y-auto bg-background border-l border-border">
      <div className="p-4 space-y-6">
        
        {/* Trending Topics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <Link
                  key={topic.tag}
                  to={`/app/search?q=${encodeURIComponent(topic.tag)}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-sm">{topic.tag}</span>
                        {topic.isGrowing && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link 
              to="/app/trending"
              className="inline-flex items-center justify-center w-full mt-3 h-8 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors duration-200"
            >
              Show more
            </Link>
          </CardContent>
        </Card>

        {/* Suggested Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Who to Follow
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <Link
                    to={`/app/user/${user.username}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        {user.isVerified && (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </Link>
                  <Button size="sm" variant="outline">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
            <Link 
              to="/app/discover"
              className="inline-flex items-center justify-center w-full mt-3 h-8 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors duration-200"
            >
              Discover more
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/app/events/${event.id}`}
                  className="block p-3 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
                >
                  <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{event.date}</span>
                    <span>{event.participants} attending</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link 
              to="/app/events"
              className="inline-flex items-center justify-center w-full mt-3 h-8 px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors duration-200"
            >
              View all events
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}