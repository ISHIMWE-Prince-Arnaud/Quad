import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { ChatMedia } from "@/types/chat";
import { Loader2, Plus, SendHorizontal, X, Smile } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "./constants";
import { Button } from "@/components/ui/button";

export function ChatComposer({
  text,
  media,
  uploading,
  sending,
  onTextChange,
  onRemoveMedia,
  onFileSelected,
  onSend,
}: {
  text: string;
  media: ChatMedia | null;
  uploading: boolean;
  sending: boolean;
  onTextChange: (v: string) => void;
  onRemoveMedia: () => void;
  onFileSelected: (file: File | null) => void;
  onSend: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAttachClick = () => fileInputRef.current?.click();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border">
      {media && (
        <div className="mb-4 relative inline-block group animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="h-24 w-24 rounded-2xl overflow-hidden border border-border shadow-md bg-muted">
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
            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
            aria-label="Remove media">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        <div className="flex-1 flex items-end gap-2 rounded-[24px] bg-secondary/50 border border-transparent focus-within:border-primary/20 focus-within:bg-secondary/70 focus-within:shadow-sm px-4 py-3 transition-all duration-200">
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={uploading}
            className="h-8 w-8 -ml-1 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-full flex items-center justify-center transition-colors shrink-0"
            aria-label="Attach media">
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-foreground placeholder:text-muted-foreground text-sm min-h-[24px] resize-none py-1 scrollbar-hide"
            aria-label="Message input"
          />

          <button
            type="button"
            className="h-8 w-8 -mr-1 text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-full flex items-center justify-center transition-colors shrink-0"
            aria-label="Insert emoji">
            <Smile className="h-5 w-5" />
          </button>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={onSend}
          disabled={sending || (!text.trim() && !media)}
          className={cn(
            "h-12 w-12 rounded-full shrink-0 shadow-md transition-all",
            sending || (!text.trim() && !media)
              ? "opacity-80"
              : "hover:scale-105 active:scale-95 hover:shadow-lg"
          )}>
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizontal className="h-5 w-5 ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
