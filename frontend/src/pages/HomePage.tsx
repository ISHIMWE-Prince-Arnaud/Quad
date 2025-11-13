import { Link } from 'react-router-dom'
import { useThemeStore } from '../stores/themeStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export default function HomePage() {
  const { isDarkMode, toggleDarkMode } = useThemeStore()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Quad
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The next-generation social media platform with real-time chat, stories, polls, and more.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link to="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" size="lg">Get Started</Button>
          </Link>
        </div>

        {/* Theme Toggle */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm">Light</span>
              <Switch 
                checked={isDarkMode}
                onChange={toggleDarkMode}
              />
              <span className="text-sm">Dark</span>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Currently using {isDarkMode ? 'Dark' : 'Light'} mode
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
