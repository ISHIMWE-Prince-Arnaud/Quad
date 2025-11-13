import { SignIn } from '@clerk/clerk-react'
import { useThemeStore } from '@/stores/themeStore'
import { getClerkAppearance } from '@/lib/clerkTheme'

export default function LoginPage() {
  const { isDarkMode } = useThemeStore()

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4">
      <div className="w-full max-w-md">
        <SignIn 
          routing="path"
          path="/login"
          signUpUrl="/signup"
          appearance={getClerkAppearance(isDarkMode)}
        />
      </div>
    </div>
  )
}
