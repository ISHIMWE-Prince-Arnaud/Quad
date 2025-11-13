import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  
  // Actions
  toggleDarkMode: () => void
  applyTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,

      toggleDarkMode: () => {
        const newDarkMode = !get().isDarkMode
        
        set({ isDarkMode: newDarkMode })
        
        // Apply theme to DOM (only dark class, no data-theme)
        if (newDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      applyTheme: () => {
        const isDark = get().isDarkMode
        
        // Apply theme to DOM (only dark class, no data-theme)
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
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
