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
      <DropdownMenuContent align="start">
        {REACTIONS.map((r) => (
          <DropdownMenuItem key={r.type} onClick={() => onSelect(r.type)}>
            <span className="mr-2">{r.emoji}</span>
            <span>{r.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
