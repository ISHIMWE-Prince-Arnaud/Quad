import { useCallback } from "react";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";
import { logError } from "@/lib/errorHandling";
import { copyToClipboard } from "@/lib/utils";

export function useStoryShare({
  storyId,
  title,
}: {
  storyId: string;
  title: string;
}) {
  return useCallback(async () => {
    const path = `/app/stories/${storyId}`;
    const url = `${window.location.origin}${path}`;

    try {
      const ok = await copyToClipboard(url);
      if (ok) {
        showSuccessToast("Link copied");
      } else {
        showErrorToast("Failed to copy link");
      }
    } catch (e) {
      logError(e, {
        component: "useStoryShare",
        action: "copyLink",
        metadata: { storyId, title },
      });
      showErrorToast("Failed to copy link");
    }
  }, [storyId, title]);
}
