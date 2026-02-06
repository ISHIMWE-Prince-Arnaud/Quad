import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { effectiveTheme, setTheme } = useThemeStore();

  return (
    <div className="p-6 pt-4 border-t border-border/40 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div
        role="group"
        aria-label="Theme"
        className="flex items-center justify-between rounded-full bg-muted/50 border border-border/40 p-1">
        <button
          type="button"
          onClick={() => setTheme("light")}
          aria-pressed={effectiveTheme === "light"}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            effectiveTheme === "light"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground",
          )}
          title="Light">
          <Sun className="h-4 w-4" />
          Light
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          aria-pressed={effectiveTheme === "dark"}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
            effectiveTheme === "dark"
              ? "bg-primary text-primary-foreground shadow-md"
              : "text-muted-foreground hover:text-foreground",
          )}
          title="Dark">
          <Moon className="h-4 w-4" />
          Dark
        </button>
      </div>
    </div>
  );
}
