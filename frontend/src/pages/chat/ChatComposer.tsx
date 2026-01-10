import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMedia } from "@/types/chat";
import { Image as ImageIcon, Loader2, Send, Smile, X } from "lucide-react";
import { COMPOSER_EMOJIS, MAX_MESSAGE_LENGTH } from "./constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ChatComposer({
  text,
  media,
  uploading,
  sending,
  onTextChange,
  onRemoveMedia,
  onFileSelected,
  onInsertEmoji,
  onSend,
}: {
  text: string;
  media: ChatMedia | null;
  uploading: boolean;
  sending: boolean;
  onTextChange: (v: string) => void;
  onRemoveMedia: () => void;
  onFileSelected: (file: File | null) => void;
  onInsertEmoji: (emoji: string) => void;
  onSend: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => fileInputRef.current?.click();

  return (
    <div className="p-4 bg-[#0a0c10] border-t border-border/5">
      {media && (
        <div className="mb-4 relative inline-block group">
          <div className="h-20 w-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt="Attached media"
                className="h-full w-full object-cover"
              />
            ) : (
              <video src={media.url} className="h-full w-full object-cover" />
            )}
          </div>
          <button
            onClick={onRemoveMedia}
            className="absolute -top-2 -right-2 p-1 bg-destructive text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove media">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 bg-[#1e293b]/50 rounded-2xl p-2 pl-4 border border-white/5 shadow-inner">
        <button
          type="button"
          onClick={handleAttachClick}
          disabled={uploading}
          className="text-[#64748b] hover:text-white transition-colors"
          aria-label="Attach media">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
        />

        <input
          type="text"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-[#64748b] text-sm"
          aria-label="Message input"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={sending || (!text.trim() && !media)}
          className={cn(
            "h-10 w-10 flex items-center justify-center rounded-full transition-all shadow-lg",
            sending || (!text.trim() && !media)
              ? "bg-[#2563eb]/50 text-white/50 cursor-not-allowed"
              : "bg-[#2563eb] text-white hover:scale-105 active:scale-95"
          )}
          aria-label="Send message">
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
}
