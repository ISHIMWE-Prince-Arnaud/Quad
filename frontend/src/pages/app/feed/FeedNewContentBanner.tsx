import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function FeedNewContentBanner({
  newCount,
  loading,
  onRefresh,
}: {
  newCount: number;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (newCount <= 0 || loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="sticky top-3 z-20">
      <Card
        className="shadow-card bg-card/95 backdrop-blur-sm border border-border/40 rounded-full cursor-pointer transition-all duration-200 hover:border-border/60 hover:shadow-card-hover active:scale-[0.99]"
        onClick={onRefresh}>
        <CardContent className="py-2 px-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="relative h-9 w-9 rounded-full bg-primary/10 border border-primary/20 grid place-items-center shrink-0">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            </span>

            <div className="min-w-0 leading-tight">
              <div className="text-sm font-bold text-foreground truncate">
                {newCount} new {newCount === 1 ? "post" : "posts"}
              </div>
              <div className="text-xs text-muted-foreground/60 truncate">
                Tap to load the latest content
              </div>
            </div>
          </div>

          <Button
            size="sm"
            className="rounded-full px-5 font-bold shadow-md shadow-primary/15 active:scale-95 transition-transform">
            Show
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
