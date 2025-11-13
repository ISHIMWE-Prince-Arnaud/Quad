import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// DaisyUI themes (Slack-like theme switching)
export const DAISYUI_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
] as const

export type DaisyUITheme = typeof DAISYUI_THEMES[number]

interface ThemeState {
  theme: DaisyUITheme
  isDarkMode: boolean
  
  // Actions
  setTheme: (theme: DaisyUITheme) => void
  toggleDarkMode: () => void
  applyTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      isDarkMode: true,

      setTheme: (theme) => {
        set({ 
          theme,
          isDarkMode: [
            'dark', 'synthwave', 'halloween', 'forest', 'black', 
            'luxury', 'dracula', 'night', 'coffee', 'dim'
          ].includes(theme)
        })
        get().applyTheme()
      },

      toggleDarkMode: () => {
        const isDark = get().isDarkMode
        
        // Switch between light and dark variants
        if (isDark) {
          get().setTheme('light')
        } else {
          get().setTheme('dark')
        }
      },

      applyTheme: () => {
        const theme = get().theme
        document.documentElement.setAttribute('data-theme', theme)
        
        // Also apply dark class for shadcn/ui compatibility
        if (get().isDarkMode) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
    }),
    {
      name: 'quad-theme-storage',
      onRehydrateStorage: () => (state) => {
        // Apply theme after hydration
        if (state) {
          state.applyTheme()
        }
      },
    }
  )
)
