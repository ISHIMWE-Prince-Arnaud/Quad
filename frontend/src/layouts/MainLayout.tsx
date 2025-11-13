import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar'
import { RightPanel } from '../components/layout/RightPanel'

export function MainLayout() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto">
            <main className="px-4 py-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden xl:flex xl:w-80 xl:flex-col xl:fixed xl:right-0 xl:inset-y-0">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}
