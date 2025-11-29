import { Outlet } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { RightPanel } from "../components/layout/RightPanel";
import { useAuthStore } from "@/stores/authStore";
import { LoadingSpinner } from "@/components/ui/loading";

export function MainLayout() {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
        <div className="flex-1 lg:pl-64 xl:pr-80">
          <div className="max-w-4xl mx-auto">
            <main className="px-4 py-6 sm:px-6 lg:px-8">
              <Outlet />
            </main>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden xl:flex xl:w-80 xl:flex-col xl:fixed xl:right-0 xl:inset-y-0 xl:z-10">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
