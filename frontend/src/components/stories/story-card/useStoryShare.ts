import { useCallback } from "react";
import toast from "react-hot-toast";
import { logError } from "@/lib/errorHandling";
import { copyToClipboard } from "@/lib/utils";

export function useStoryShare({ storyId, title }: { storyId: string; title: string }) {
  return useCallback(async () => {
    const path = `/app/stories/${storyId}`;
    const url = `${window.location.origin}${path}`;

    try {
      const ok = await copyToClipboard(url);
      if (ok) {
        toast.success("Story link copied to clipboard");
      } else {
        toast.error("Failed to copy link");
      }
    } catch (e) {
      logError(e, {
        component: "useStoryShare",
        action: "copyLink",
        metadata: { storyId, title },
      });
      toast.error("Failed to copy link");
    }
  }, [storyId, title]);
}
