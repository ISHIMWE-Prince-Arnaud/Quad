import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from '../stores/themeStore'
import { useAuthSync } from '../hooks/useAuthSync'
import { useEffect } from 'react'

export function RootLayout() {
  // Sync auth state with Clerk
  useAuthSync()

  // Initialize theme system
  const { initializeTheme, applyTheme } = useThemeStore()
  
  useEffect(() => {
    initializeTheme()
    applyTheme()
  }, [initializeTheme, applyTheme])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
      
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-card text-card-foreground border border-border',
          duration: 4000,
        }}
      />
    </div>
  )
}
