import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { ChatService } from "@/services/chatService";
import type { ChatMessage } from "@/types/chat";
import { logError } from "@/lib/errorHandling";
import { showErrorToast } from "@/lib/error-handling/toasts";

export function useChatHistory({
  onInitialLoaded,
  onPrepended,
}: {
  onInitialLoaded?: () => void;
  onPrepended?: (prependedCount: number) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const oldestMessageId = useMemo(
    () => (messages.length > 0 ? messages[0].id : null),
    [messages],
  );
  const newestMessageId = useMemo(
    () => (messages.length > 0 ? messages[messages.length - 1].id : null),
    [messages],
  );

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setInitialLoadError(null);
        setLoading(true);
        const res = await ChatService.getMessages({ page: 1, limit: 30 });
        if (cancelled) return;
        if (res.success) {
          setMessages(res.data);
          setHasMoreOlder(res.pagination?.hasMore ?? false);
        } else {
          setInitialLoadError("Failed to load chat");
          showErrorToast("Failed to load chat");
        }
      } catch (err) {
        logError(err, {
          component: "ChatHistory",
          action: "loadInitialMessages",
        });
        if (!cancelled) setInitialLoadError("Failed to load chat");
        showErrorToast("Failed to load chat");
      } finally {
        if (!cancelled) setLoading(false);
        if (!cancelled) onInitialLoaded?.();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onInitialLoaded, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const loadOlder = useCallback(async () => {
    if (!oldestMessageId || loadingOlder) return;
    try {
      setLoadingOlder(true);

      const res = await ChatService.getMessages({
        before: oldestMessageId,
        limit: 30,
        page: 1,
      });
      if (res.success && res.data.length > 0) {
        setMessages((prev) => [...res.data, ...prev]);
        setHasMoreOlder(res.pagination?.hasMore ?? false);
        onPrepended?.(res.data.length);
      } else {
        setHasMoreOlder(false);
      }
    } catch (err) {
      logError(err, {
        component: "ChatHistory",
        action: "loadOlderMessages",
        metadata: { oldestMessageId },
      });
      showErrorToast("Failed to load older messages");
    } finally {
      setLoadingOlder(false);
    }
  }, [oldestMessageId, loadingOlder, onPrepended]);

  return {
    messages,
    setMessages: setMessages as Dispatch<SetStateAction<ChatMessage[]>>,
    loading,
    initialLoadError,
    loadingOlder,
    hasMoreOlder,
    newestMessageId,
    loadOlder,
    reload,
  };
}
