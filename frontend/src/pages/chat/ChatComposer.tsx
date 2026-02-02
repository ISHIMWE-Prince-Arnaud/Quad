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
    <div className="pt-4 border-t border-border">
      <div className="flex items-end gap-3">
        <div className="flex-1 flex items-end gap-2 rounded-[24px] bg-secondary/50 border border-transparent focus-within:border-primary/20 focus-within:bg-secondary/70 focus-within:shadow-sm px-4 py-3 transition-all duration-200">
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
            "h-12 w-12 rounded-full shrink-0 shadow-md transition-all",
            sending || !text.trim()
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
