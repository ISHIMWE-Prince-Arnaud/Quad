import type { Poll } from "@/types/poll";

export type PollCardProps = {
  poll: Poll;
  onDelete?: (pollId: string) => void | Promise<void>;
  onUpdate?: (updatedPoll: Poll) => void;
  className?: string;
};
