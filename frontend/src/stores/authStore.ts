import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  clerkId: string
  username: string
  email: string
  displayName?: string
  bio?: string
  profileImage?: string
  coverImage?: string
  followersCount: number
  followingCount: number
  postsCount: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user, 
          isLoading: false 
        })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      logout: () => {
        localStorage.removeItem('clerk-db-jwt')
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        })
      },

      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { 
              ...currentUser, 
              ...userData 
            } 
          })
        }
      },
    }),
    {
      name: 'quad-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
