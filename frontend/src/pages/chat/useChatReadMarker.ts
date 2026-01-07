import { useEffect, useState } from "react";

import { ChatService } from "@/services/chatService";

export function useChatReadMarker({
  newestMessageId,
  nearBottom,
}: {
  newestMessageId: string | null;
  nearBottom: boolean;
}) {
  const [lastReadId, setLastReadId] = useState<string | null>(null);

  useEffect(() => {
    if (!newestMessageId) return;
    if (!nearBottom) return;
    if (lastReadId === newestMessageId) return;
    (async () => {
      try {
        const res = await ChatService.markAsRead(newestMessageId);
        if (res.success) setLastReadId(newestMessageId);
      } catch {
        // ignore read-marker errors for now
      }
    })();
  }, [newestMessageId, nearBottom, lastReadId]);
}
