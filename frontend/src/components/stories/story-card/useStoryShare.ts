import { useCallback } from "react";
import toast from "react-hot-toast";
import { logError } from "@/lib/errorHandling";

export function useStoryShare({ storyId, title }: { storyId: string; title: string }) {
  return useCallback(async () => {
    const path = `/app/stories/${storyId}`;
    const url = `${window.location.origin}${path}`;

    try {
      const shareFn = (
        navigator as unknown as {
          share?: (data: { url?: string; title?: string; text?: string }) => Promise<void>;
        }
      ).share;
      if (typeof shareFn === "function") {
        await shareFn({ url, title });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Story link copied to clipboard");
      }
    } catch (e) {
      logError(e, { component: "useStoryShare", action: "copyLink", metadata: { storyId } });
      toast.error("Failed to copy link");
    }
  }, [storyId, title]);
}
