import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2, SendHorizontal } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "./constants";
import { Button } from "@/components/ui/button";

export function ChatComposer({
  text,
  sending,
  onTextChange,
  onSend,
}: {
  text: string;
  sending: boolean;
  onTextChange: (v: string) => void;
  onSend: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="py-4 px-6 bg-background/80 backdrop-blur-md border-t border-border/50 sticky bottom-0">
      <div className="flex items-end gap-3 max-w-4xl mx-auto w-full">
        <div className="flex-1 min-w-0 flex items-end gap-2 rounded-[1.5rem] bg-muted/50 border border-border/40 focus-within:border-primary/30 focus-within:bg-background focus-within:shadow-md px-4 py-2.5 transition-all duration-200">
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
        </div>

        <Button
          type="button"
          size="icon"
          onClick={onSend}
          disabled={sending || !text.trim()}
          className={cn(
            "h-11 w-11 rounded-full shrink-0 shadow-sm transition-all",
            sending || !text.trim()
              ? "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:scale-105 active:scale-95 hover:shadow-primary/20 hover:shadow-lg",
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
