import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from '../stores/themeStore'
import { useEffect } from 'react'

export function RootLayout() {
  const { applyTheme } = useThemeStore()

  useEffect(() => {
    // Apply theme on mount
    applyTheme()
  }, [applyTheme])

  return (
    <>
      <div className="min-h-screen bg-base-100">
        <Outlet />
      </div>
      
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-base-200 text-base-content border border-base-300',
          duration: 4000,
          success: {
            className: 'bg-success text-success-content',
          },
          error: {
            className: 'bg-error text-error-content',
          },
        }}
      />
    </>
  )
}
