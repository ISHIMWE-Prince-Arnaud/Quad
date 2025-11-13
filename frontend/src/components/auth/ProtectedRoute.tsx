import { useAuth } from '@clerk/clerk-react'
import { Navigate, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { LoadingSpinner } from '@/components/ui/loading'
import type { PermissionType } from '@/lib/security'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermissions?: PermissionType[]
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = []
}: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const location = useLocation()

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // TODO: Add permission checking when user roles are implemented
  // For now, all authenticated users have access
  if (requiredPermissions.length > 0) {
    // In a real implementation, you'd check user permissions here
    console.log('Permission checking not implemented yet:', requiredPermissions)
  }

  return <>{children}</>
}

