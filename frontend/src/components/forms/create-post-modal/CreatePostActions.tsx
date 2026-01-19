import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CreatePostActions({
  hasContent,
  isSubmitted,
  isLoading,
  isOverLimit,
  onCancel,
}: {
  hasContent: boolean;
  isSubmitted: boolean;
  isLoading: boolean;
  isOverLimit: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/5">
      <div className="text-sm text-muted-foreground">
        {!hasContent && isSubmitted && (
          <span className="text-destructive">Post must have at least one media</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="text-[#94a3b8] hover:text-white hover:bg-secondary">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isOverLimit || !hasContent}
          className="min-w-[110px] rounded-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </div>
  );
}
