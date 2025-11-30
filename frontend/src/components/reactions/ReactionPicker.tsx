import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactionType } from "@/services/reactionService";
import type { ReactNode } from "react";

const REACTIONS: { type: ReactionType; label: string; emoji: string }[] = [
  { type: "like", label: "Like", emoji: "👍" },
  { type: "love", label: "Love", emoji: "❤️" },
  { type: "laugh", label: "Laugh", emoji: "😂" },
  { type: "wow", label: "Wow", emoji: "😮" },
  { type: "sad", label: "Sad", emoji: "😢" },
  { type: "angry", label: "Angry", emoji: "😡" },
];

interface ReactionPickerProps {
  onSelect: (type: ReactionType) => void;
  trigger: ReactNode;
}

export function ReactionPicker({ onSelect, trigger }: ReactionPickerProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>{trigger}</div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="animate-scale-in">
        {REACTIONS.map((r, index) => (
          <DropdownMenuItem
            key={r.type}
            onClick={() => onSelect(r.type)}
            className="cursor-pointer transition-all duration-200 hover:scale-105"
            style={{
              animationDelay: `${index * 30}ms`,
              animation: "slide-in-from-left 0.2s ease-out forwards",
              opacity: 0,
            }}>
            <span className="mr-2 text-lg transition-transform duration-200 hover:scale-125">
              {r.emoji}
            </span>
            <span>{r.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
