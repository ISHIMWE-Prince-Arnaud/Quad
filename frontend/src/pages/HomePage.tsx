import { Link } from 'react-router-dom'
import { useThemeStore, DAISYUI_THEMES } from '../stores/themeStore'

export default function HomePage() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Welcome to Quad
        </h1>
        
        <p className="text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
          The next-generation social media platform with real-time chat, stories, polls, and more.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link 
            to="/login" 
            className="btn btn-primary btn-lg"
          >
            Sign In
          </Link>
          <Link 
            to="/signup" 
            className="btn btn-outline btn-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Theme Selector */}
        <div className="card bg-base-200 shadow-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Choose Your Theme</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {DAISYUI_THEMES.map((themeName) => (
              <button
                key={themeName}
                onClick={() => setTheme(themeName)}
                className={`btn btn-sm capitalize ${
                  theme === themeName ? 'btn-primary' : 'btn-ghost'
                }`}
              >
                {themeName}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
