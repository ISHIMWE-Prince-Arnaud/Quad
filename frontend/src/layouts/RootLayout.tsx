import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from '../stores/themeStore'
import { useEffect } from 'react'

export function RootLayout() {
  const { applyTheme } = useThemeStore()

  useEffect(() => {
    // Initialize theme on mount
    applyTheme()
  }, [applyTheme])

  return (
    <>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
      
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-card text-card-foreground border border-border',
          duration: 4000,
        }}
      />
    </>
  )
}
