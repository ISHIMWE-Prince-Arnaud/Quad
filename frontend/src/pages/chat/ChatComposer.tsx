import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatMedia } from "@/types/chat";
import {
  Image as ImageIcon,
  Loader2,
  Send,
  Smile,
  X,
} from "lucide-react";
import {
  COMPOSER_EMOJIS,
  MAX_MESSAGE_LENGTH,
} from "./constants";
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
    <div className="border-t px-4 py-3">
      {media && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-lg border p-2 bg-muted">
          {media.type === "image" ? (
            <img
              src={media.url}
              alt="Attached media"
              className="h-14 w-14 object-cover rounded"
            />
          ) : (
            <video src={media.url} className="h-14 w-14 rounded" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemoveMedia}
            aria-label="Remove media">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleAttachClick}
          disabled={uploading}
          aria-label="Attach media">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => onFileSelected(e.target.files?.[0] || null)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Insert emoji">
              <Smile className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px]">
            {COMPOSER_EMOJIS.map((emoji) => (
              <DropdownMenuItem key={emoji} onClick={() => onInsertEmoji(emoji)}>
                <span className="text-lg">{emoji}</span>
                <span className="sr-only">Insert emoji</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1 relative">
          <Textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Write a message"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            className="min-h-[44px] resize-none pr-16"
            aria-label="Message input"
          />
          <div
            className={cn(
              "absolute bottom-2 right-2 text-xs",
              text.length > MAX_MESSAGE_LENGTH * 0.9
                ? "text-destructive"
                : "text-muted-foreground"
            )}>
            {text.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>

        <Button
          type="button"
          onClick={onSend}
          disabled={
            sending ||
            (!text.trim() && !media) ||
            text.length > MAX_MESSAGE_LENGTH
          }
          aria-label="Send message">
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
