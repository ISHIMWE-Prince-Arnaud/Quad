import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Higher-order component version for route configuration
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
