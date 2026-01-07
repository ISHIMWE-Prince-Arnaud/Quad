import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { UploadService } from "@/services/uploadService";
import { ChatService } from "@/services/chatService";
import type { ChatMedia, ChatMessage } from "@/types/chat";

export function useChatComposer({
  emitTypingStart,
  emitTypingStop,
  onMessageSent,
}: {
  emitTypingStart: () => void;
  emitTypingStop: () => void;
  onMessageSent: (m: ChatMessage) => void;
}) {
  const [text, setText] = useState("");
  const [media, setMedia] = useState<ChatMedia | null>(null);
  const [uploading, setUploading] = useState(false);
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

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const { url } = await UploadService.uploadChatMedia(file);
      const chatMedia: ChatMedia = {
        url,
        type: file.type.startsWith("video/") ? "video" : "image",
      };
      setMedia(chatMedia);
      toast.success("Media attached");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    const contentOk = (text && text.trim().length > 0) || media;
    if (!contentOk || sending) return;
    try {
      setSending(true);
      const res = await ChatService.sendMessage({
        text: text.trim() || undefined,
        media: media || undefined,
      });
      if (res.success && res.data) {
        onMessageSent(res.data);
        setText("");
        setMedia(null);
        emitTypingStop();
      } else {
        toast.error(res.message || "Failed to send");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return {
    text,
    media,
    uploading,
    sending,
    setMedia,
    handleTextChange,
    handleFileSelected,
    handleSend,
  };
}
