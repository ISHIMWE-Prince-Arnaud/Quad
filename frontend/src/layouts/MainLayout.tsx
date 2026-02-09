import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { RightPanel } from "../components/layout/RightPanel";
import { useAuthStore } from "@/stores/authStore";
import { MainAppSkeleton } from "@/components/ui/loading";
import { AnimatePresence, motion } from "framer-motion";

export function MainLayout() {
  const { isLoading } = useAuthStore();
  const location = useLocation();

  const isChatRoute =
    location.pathname === "/app/chat" ||
    location.pathname.startsWith("/app/chat/");

  if (isLoading) {
    return <MainAppSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Links for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
        tabIndex={0}>
        Skip to main content
      </a>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Left Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64 xl:pr-80 min-w-0">
          <div className="max-w-4xl mx-auto min-w-0">
            <main
              id="main-content"
              className={
                isChatRoute
                  ? "p-0 h-[calc(100vh-4rem)] lg:h-screen overflow-hidden"
                  : "px-4 py-6 sm:px-6 lg:px-8"
              }
              tabIndex={-1}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  className={isChatRoute ? "h-full" : undefined}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}>
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden xl:flex xl:w-80 xl:flex-col xl:fixed xl:right-0 xl:inset-y-0 z-40">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
