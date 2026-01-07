import { useCallback } from "react";
import toast from "react-hot-toast";

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
      console.error("Failed to copy link:", e);
      toast.error("Failed to copy link");
    }
  }, [storyId, title]);
}
