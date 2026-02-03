import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { ChatService } from "@/services/chatService";
import type { ChatMessage } from "@/types/chat";
import { logError } from "@/lib/errorHandling";

export function useChatComposer({
  emitTypingStart,
  emitTypingStop,
  onMessageSent,
  onSendStart,
  onSendError,
}: {
  emitTypingStart: () => void;
  emitTypingStop: () => void;
  onMessageSent: (m: ChatMessage) => void;
  onSendStart?: (text: string) => void;
  onSendError?: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimerRef = useRef<number | null>(null);

  const handleTextChange = (v: string) => {
    setText(v);
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    emitTypingStart();
    typingTimerRef.current = window.setTimeout(() => {
      emitTypingStop();
      typingTimerRef.current = null;
    }, 1500);
  };

  const handleSend = async () => {
    const contentOk = text && text.trim().length > 0;
    if (!contentOk || sending) return;
    const preparedText = text ? text.trim() : "";
    try {
      setSending(true);

      setText("");
      emitTypingStop();
      onSendStart?.(preparedText);

      const res = await ChatService.sendMessage({
        text: preparedText || undefined,
      });
      if (res.success && res.data) {
        onMessageSent(res.data);
      } else {
        setText(preparedText);
        onSendError?.(preparedText);
        toast.error(res.message || "Failed to send");
      }
    } catch (err) {
      logError(err, { component: "ChatComposer", action: "sendMessage" });
      setText(preparedText);
      onSendError?.(preparedText);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return {
    text,
    sending,
    handleTextChange,
    handleSend,
  };
}
