import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { PollCardProps } from "./poll-card/types";
import { PollCardHeader } from "./poll-card/PollCardHeader";
import { PollVotingSection } from "./poll-card/PollVotingSection";
import { PollCardFooter } from "./poll-card/PollCardFooter";
import { usePollReactions } from "./poll-card/usePollReactions";
import { usePollBookmark } from "./poll-card/usePollBookmark";
import { usePollVoting } from "./poll-card/usePollVoting";
import { logError } from "@/lib/errorHandling";

export function PollCard({
  poll,
  onDelete,
  onUpdate,
  className,
}: PollCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === poll.author.clerkId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 
   const displayName = poll.author.username;

   const { bookmarked, toggleBookmark } = usePollBookmark(poll.id);
   const {
     userReaction,
     reactionPending,
     reactionCount,
     reactionCounts,
     selectedEmoji,
     handleSelectReaction,
   } = usePollReactions(poll.id, poll.reactionsCount || 0);

   const {
     localPoll,
     selectedIndices,
     voting,
     canVote,
     toggleSelection,
     handleVote,
     handleRemoveVote,
   } = usePollVoting(poll, onUpdate);

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(poll.id);
    setIsDeleteDialogOpen(false);
  };

  const handleCopyLink = async () => {
    const path = `/app/polls/${poll.id}`;
    const url = `${window.location.origin}${path}`;

    try {
      const ok = await copyToClipboard(url);
      if (ok) {
        toast.success("Poll link copied to clipboard");
      } else {
        toast.error("Failed to copy link");
      }
    } catch (e) {
      logError(e, { component: "PollCard", action: "copyLink", metadata: { pollId: poll.id } });
      toast.error("Failed to copy link");
    }
  };

  const handleEdit = () => {
    navigate(`/app/polls/${poll.id}/edit`);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <Card className={cn("w-full", className)}>
          <CardHeader className="pb-3">
            <PollCardHeader
              poll={poll}
              displayName={displayName}
              isOwner={isOwner}
              onCopyLink={() => void handleCopyLink()}
              onEdit={handleEdit}
              onRequestDelete={() => setIsDeleteDialogOpen(true)}
            />
          </CardHeader>
          <PollVotingSection
            poll={poll}
            localPoll={localPoll}
            selectedIndices={selectedIndices}
            canVote={canVote}
            voting={voting}
            onToggleSelection={toggleSelection}
            onVote={() => void handleVote()}
            onRemoveVote={() => void handleRemoveVote()}
          />

          <PollCardFooter
            pollId={poll.id}
            commentsCount={poll.commentsCount || 0}
            onCopyLink={() => void handleCopyLink()}
            bookmarked={bookmarked}
            onToggleBookmark={toggleBookmark}
            userReaction={userReaction}
            selectedEmoji={selectedEmoji}
            reactionCount={reactionCount}
            reactionCounts={reactionCounts}
            reactionPending={reactionPending}
            onSelectReaction={(type) => void handleSelectReaction(type)}
          />
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete poll?"
        description="This action cannot be undone. This will permanently delete your poll."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
