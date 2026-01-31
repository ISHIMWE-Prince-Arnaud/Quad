import { type ReactNode } from "react";
import { SquarePen, Images, BarChart3, Bookmark } from "lucide-react";
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
    <div className={cn("bg-background border-b border-border", className)}>
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
          <div className="flex space-x-1 w-full">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center justify-center relative group flex-1 py-2",
                  )}
                  title={tab.description}>
                  <span
                    className={cn(
                      "inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    )}>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
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
