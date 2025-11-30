import { Moon, Sun, Monitor } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg hover:bg-accent transition-colors duration-200"
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}>
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

// Advanced theme selector with system preference option
export function AdvancedThemeSelector() {
  const { theme, setTheme } = useThemeStore();

  const themes = [
    { name: "Light", icon: Sun, value: "light" as const },
    { name: "Dark", icon: Moon, value: "dark" as const },
    { name: "System", icon: Monitor, value: "system" as const },
  ];

  return (
    <div
      className="flex items-center gap-1 p-1 bg-accent rounded-lg"
      role="group"
      aria-label="Theme selector">
      {themes.map(({ name, icon: Icon, value }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center justify-center p-2 rounded-md text-xs font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={`Switch to ${name.toLowerCase()} mode`}
          aria-label={`Switch to ${name.toLowerCase()} theme`}
          aria-pressed={theme === value}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
