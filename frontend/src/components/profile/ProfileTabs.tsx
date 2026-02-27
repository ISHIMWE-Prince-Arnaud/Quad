import { type ReactNode } from "react";
import { SquarePen, Images, BarChart3, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type ProfileTab = "posts" | "stories" | "polls" | "saved";

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isOwnProfile?: boolean;
  className?: string;
}

const tabs = [
  {
    id: "posts" as ProfileTab,
    label: "Posts",
    icon: SquarePen,
    description: "All posts and updates",
    public: true,
  },
  {
    id: "stories" as ProfileTab,
    label: "Stories",
    icon: Images,
    description: "Shared stories and moments",
    public: true,
  },
  {
    id: "polls" as ProfileTab,
    label: "Polls",
    icon: BarChart3,
    description: "Created and participated polls",
    public: true,
  },
  {
    id: "saved" as ProfileTab,
    label: "Bookmarks",
    icon: Bookmark,
    description: "Saved posts and content",
    public: false, // Only visible to own profile
  },
];

export function ProfileTabs({
  activeTab,
  onTabChange,
  isOwnProfile = false,
  className,
}: ProfileTabsProps) {
  const visibleTabs = tabs.filter((tab) => tab.public || isOwnProfile);

  return (
    <div
      className={cn(
        "bg-background/80 backdrop-blur-sm border-b border-border/60 sticky top-0 z-10",
        className,
      )}>
      <div className="max-w-4xl mx-auto">
        {/* Mobile Tab Navigation */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => onTabChange(e.target.value as ProfileTab)}
            className="w-full p-3 bg-background border-0 text-foreground font-medium focus:outline-none">
            {visibleTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:flex">
          <div className="flex w-full">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex-1 flex items-center justify-center py-3 transition-colors duration-200",
                  )}
                  title={tab.description}>
                  <span
                    className={cn(
                      "relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}>
                    {isActive && (
                      <motion.div
                        layoutId="profileTabIndicator"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon className="h-4 w-4 relative z-10" />
                    <span className="hidden sm:inline relative z-10">
                      {tab.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab content wrapper for consistent styling
export function TabContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-4xl mx-auto px-4 py-6", className)}>
      {children}
    </div>
  );
}
