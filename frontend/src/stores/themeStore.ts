import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  isDarkMode: boolean
  
  // Actions
  setTheme: (theme: Theme) => void
  toggleDarkMode: () => void
  applyTheme: () => void
  initializeTheme: () => void
}

// Helper function to detect system preference
const getSystemTheme = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

// Helper function to calculate effective dark mode
const calculateDarkMode = (theme: Theme): boolean => {
  switch (theme) {
    case 'dark':
      return true
    case 'light':
      return false
    case 'system':
      return getSystemTheme()
    default:
      return false
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isDarkMode: getSystemTheme(),

      setTheme: (theme: Theme) => {
        const isDarkMode = calculateDarkMode(theme)
        set({ theme, isDarkMode })
        
        // Apply theme to DOM
        if (isDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleDarkMode: () => {
        const currentTheme = get().theme
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        get().setTheme(newTheme)
      },

      applyTheme: () => {
        const { theme } = get()
        const isDarkMode = calculateDarkMode(theme)
        set({ isDarkMode })
        
        // Apply theme to DOM
        if (isDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      initializeTheme: () => {
        // Listen for system theme changes
        if (typeof window !== 'undefined') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          const handleChange = () => {
            const { theme } = get()
            if (theme === 'system') {
              get().applyTheme()
            }
          }
          
          mediaQuery.addEventListener('change', handleChange)
          
          // Apply initial theme
          get().applyTheme()
        }
      },
    }),
    {
      name: 'quad-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.applyTheme()
        }
      },
    }
  )
)
