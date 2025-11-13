import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  clerkId: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  profileImage?: string
  coverImage?: string
  bio?: string
  isVerified?: boolean
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  syncWithClerk: (clerkUser: unknown) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      syncWithClerk: (clerkUser) => {
        if (clerkUser && typeof clerkUser === 'object') {
          const user = clerkUser as any // Type assertion for Clerk user object
          const userData: User = {
            _id: '', // Will be set after backend sync
            clerkId: user.id || '',
            username: user.username || user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || '',
            email: user.emailAddresses?.[0]?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            profileImage: user.imageUrl || '',
            bio: '',
            isVerified: user.emailAddresses?.[0]?.verification?.status === 'verified',
            createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
          }
          
          set({ 
            user: userData, 
            isLoading: false, 
            error: null 
          })
        } else {
          set({ user: null })
        }
      },
      
      logout: () => {
        set({ 
          user: null, 
          isLoading: false, 
          error: null 
        })
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'quad-auth-storage',
      partialize: (state) => ({ 
        user: state.user 
      }),
    }
  )
)
