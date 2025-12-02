import { WhoToFollow } from "@/components/discovery/WhoToFollow";
import { FeaturedPoll } from "@/components/polls/FeaturedPoll";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RightPanel() {
  return (
    <div className="h-full overflow-y-auto bg-background border-l border-border">
      <div className="p-4 space-y-6">
        <FeaturedPoll />
        <WhoToFollow limit={3} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase text-center tracking-wide">
              Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center">
              <ThemeSelector />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
