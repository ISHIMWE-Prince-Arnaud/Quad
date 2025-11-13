import { useAuth, useUser, UserButton } from '@clerk/clerk-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { getClerkAppearance } from '@/lib/clerkTheme'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function UserMenu() {
  const { signOut } = useAuth()
  const { user: clerkUser } = useUser()
  const { user, logout } = useAuthStore()
  const { isDarkMode } = useThemeStore()

  const handleSignOut = async () => {
    try {
      logout()
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  if (!clerkUser) {
    return null
  }

  return (
    <div className="flex items-center gap-4">
      {/* User Info Card (for development/debugging) */}
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle className="text-sm">User Profile</CardTitle>
          <CardDescription>
            {user?.firstName} {user?.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Username:</strong> {user?.username}
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Verified:</strong> {user?.isVerified ? 'Yes' : 'No'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="w-full"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* Clerk User Button (Production ready) */}
      <UserButton 
        appearance={getClerkAppearance(isDarkMode)}
        showName
        afterSignOutUrl="/"
      />
    </div>
  )
}

// Simplified version for navigation
export function UserAvatar() {
  const { isDarkMode } = useThemeStore()
  
  return (
    <UserButton 
      appearance={getClerkAppearance(isDarkMode)}
      afterSignOutUrl="/"
    />
  )
}
