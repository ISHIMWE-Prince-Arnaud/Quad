import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactionType } from "@/services/reactionService";

const REACTIONS: { type: ReactionType; label: string; emoji: string }[] = [
  { type: "like", label: "Like", emoji: "👍" },
  { type: "love", label: "Love", emoji: "❤️" },
  { type: "laugh", label: "Laugh", emoji: "😂" },
  { type: "wow", label: "Wow", emoji: "😮" },
  { type: "sad", label: "Sad", emoji: "😢" },
  { type: "angry", label: "Angry", emoji: "😡" },
];

const LONG_PRESS_MS = 450;
const CLOSE_DELAY_MS = 180;

export function QuickReactionPicker({
  onSelect,
  onQuickSelect,
  trigger,
  quickType = "love",
  disabled,
}: {
  onSelect: (type: ReactionType) => void;
  onQuickSelect: (type: ReactionType) => void;
  trigger: ReactElement;
  quickType?: ReactionType;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const longPressTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);
  const longPressOpened = useRef(false);

  const triggerDisabled = useMemo(() => {
    return Boolean(disabled || (trigger.props as { disabled?: boolean }).disabled);
  }, [disabled, trigger.props]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          aria-disabled={triggerDisabled}
          onMouseEnter={() => {
            if (triggerDisabled) return;
            clearCloseTimer();
            setOpen(true);
          }}
          onMouseLeave={() => {
            if (triggerDisabled) return;
            scheduleClose();
          }}
          onPointerDown={(e) => {
            if (triggerDisabled) return;

            e.preventDefault();

            longPressOpened.current = false;

            if (e.pointerType !== "mouse") {
              longPressTimer.current = window.setTimeout(() => {
                longPressOpened.current = true;
                setOpen(true);
              }, LONG_PRESS_MS);
            }
          }}
          onPointerUp={(e) => {
            if (triggerDisabled) return;

            if (longPressTimer.current) {
              window.clearTimeout(longPressTimer.current);
              longPressTimer.current = null;
            }

            if (e.pointerType !== "mouse" && longPressOpened.current) {
              return;
            }

            setOpen(false);
            onQuickSelect(quickType);
          }}
          onPointerCancel={() => {
            if (longPressTimer.current) {
              window.clearTimeout(longPressTimer.current);
              longPressTimer.current = null;
            }
          }}
          onKeyDown={(e) => {
            if (triggerDisabled) return;

            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(false);
              onQuickSelect(quickType);
              return;
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}>
          {trigger}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="animate-scale-in"
        role="menu"
        aria-label="Choose a reaction"
        onMouseEnter={() => {
          if (triggerDisabled) return;
          clearCloseTimer();
        }}
        onMouseLeave={() => {
          if (triggerDisabled) return;
          setOpen(false);
        }}>
        {REACTIONS.map((r, index) => (
          <DropdownMenuItem
            key={r.type}
            onClick={() => {
              onSelect(r.type);
              setOpen(false);
            }}
            className="cursor-pointer transition-all duration-200 hover:scale-105"
            role="menuitem"
            aria-label={`React with ${r.label}`}
            style={{
              animationDelay: `${index * 30}ms`,
              animation: "slide-in-from-left 0.2s ease-out forwards",
              opacity: 0,
            }}>
            <span
              className="mr-2 text-lg transition-transform duration-200 hover:scale-125"
              aria-hidden="true">
              {r.emoji}
            </span>
            <span>{r.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
