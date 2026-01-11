import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { RightPanel } from "../components/layout/RightPanel";
import { useAuthStore } from "@/stores/authStore";
import {
  FeedSkeleton,
  SkeletonAvatar,
  SkeletonBlock,
  SkeletonLine,
} from "@/components/ui/loading";
import { AnimatePresence, motion } from "framer-motion";

function MainLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:hidden px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <SkeletonLine className="w-20" />
              <SkeletonLine className="w-28 h-3" />
            </div>
          </div>
          <SkeletonBlock className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      <div className="flex">
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="h-full px-4 py-6 space-y-6 border-r border-white/5">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <SkeletonLine className="w-20" />
                <SkeletonLine className="w-28 h-3" />
              </div>
            </div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="h-10 w-10 rounded-xl" />
                  <SkeletonLine className={i % 2 === 0 ? "w-28" : "w-20"} />
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/5 space-y-3">
              <SkeletonBlock className="h-11 w-full rounded-2xl" />
              <SkeletonBlock className="h-11 w-full rounded-2xl" />
            </div>
          </div>
        </div>

        <div className="flex-1 lg:pl-64 xl:pr-80">
          <div className="max-w-4xl mx-auto">
            <main className="px-4 py-6 sm:px-6 lg:px-8">
              <div className="space-y-8">
                <div className="space-y-2">
                  <SkeletonLine className="w-32 h-7" />
                  <SkeletonLine className="w-56 h-4" />
                </div>

                <div className="bg-[#0f121a] border border-white/5 rounded-[2rem] p-4">
                  <div className="flex gap-4">
                    <SkeletonAvatar className="h-12 w-12" />
                    <div className="flex-1 space-y-3">
                      <SkeletonLine className="w-full h-6" />
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <SkeletonBlock className="h-9 w-9 rounded-xl" />
                          <SkeletonBlock className="h-9 w-9 rounded-xl" />
                        </div>
                        <SkeletonBlock className="h-10 w-28 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <FeedSkeleton />
              </div>
            </main>
          </div>
        </div>

        <div className="hidden xl:flex xl:w-80 xl:flex-col xl:fixed xl:right-0 xl:inset-y-0 xl:z-10">
          <div className="h-full px-4 py-6 space-y-6 border-l border-white/5">
            <div className="space-y-3">
              <SkeletonLine className="w-32" />
              <SkeletonBlock className="h-40 rounded-2xl" />
            </div>
            <div className="space-y-3">
              <SkeletonLine className="w-28" />
              <SkeletonBlock className="h-52 rounded-2xl" />
            </div>
            <div className="mt-auto pt-4 border-t border-white/5">
              <SkeletonBlock className="h-12 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MainLayout() {
  const { isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <MainLayoutSkeleton />;
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
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64 xl:pr-80">
          <div className="max-w-4xl mx-auto">
            <main
              id="main-content"
              className="px-4 py-6 sm:px-6 lg:px-8"
              tabIndex={-1}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
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
        <div className="hidden xl:flex xl:w-80 xl:flex-col xl:fixed xl:right-0 xl:inset-y-0 xl:z-10">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
