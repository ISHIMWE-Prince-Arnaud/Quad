import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useAuthStore } from '@/stores/authStore'

// Custom hook to sync Clerk user with our auth store
export function useAuthSync() {
  const { user: clerkUser, isLoaded } = useUser()
  const { syncWithClerk, setLoading } = useAuthStore()

  useEffect(() => {
    if (isLoaded) {
      setLoading(false)
      syncWithClerk(clerkUser)
    } else {
      setLoading(true)
    }
  }, [clerkUser, isLoaded, syncWithClerk, setLoading])

  return { isLoaded }
}
