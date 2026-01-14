import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useAuthStore } from "@/stores/authStore";
import { getSocket } from "@/lib/socket";
import { PollDetailsCard } from "./poll/PollDetailsCard";
import { usePollData } from "./poll/usePollData";
import { usePollDelete } from "./poll/usePollDelete";
import { usePollEngagementSocket } from "./poll/usePollEngagementSocket";
import { usePollReactions } from "./poll/usePollReactions";
import { usePollVoting } from "./poll/usePollVoting";

export default function PollPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { poll, setPoll, loading, error, selectedIndices, setSelectedIndices } =
    usePollData({ id });

  usePollEngagementSocket({ id, setPoll });

  useEffect(() => {
    if (!id) return;
    const socket = getSocket();

    const handlePollExpired = (pollId: string) => {
      if (pollId !== id) return;
      setPoll((prev) => {
        if (!prev) return prev;
        const shouldRevealResults =
          prev.settings.showResults === "afterExpiry" || prev.settings.showResults === "always";
        return {
          ...prev,
          status: "expired",
          canViewResults: shouldRevealResults ? true : prev.canViewResults,
        };
      });
    };

    socket.on("pollExpired", handlePollExpired);
    return () => {
      socket.off("pollExpired", handlePollExpired);
    };
  }, [id, setPoll]);

  const { userReaction, totalReactions, handleSelectReaction } = usePollReactions({ id });

  const { voting, canVote, toggleSelection, handleVote } = usePollVoting({
    id,
    poll,
    selectedIndices,
    setSelectedIndices,
    setPoll,
  });

  const { isDeleteDialogOpen, setIsDeleteDialogOpen, deleting, handleDelete } =
    usePollDelete({ id, navigate });

  const handleEdit = () => {
    if (!id) return;
    navigate(`/app/polls/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading poll...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!poll) return null;

  const isOwner = user?.clerkId === poll.author.clerkId;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <PollDetailsCard
          poll={poll}
          isOwner={isOwner}
          selectedIndices={selectedIndices}
          canVote={canVote}
          voting={voting}
          onToggleSelection={toggleSelection}
          onVote={() => void handleVote()}
          onEdit={handleEdit}
          onRequestDelete={() => setIsDeleteDialogOpen(true)}
          userReaction={userReaction}
          totalReactions={totalReactions}
          onSelectReaction={(type) => void handleSelectReaction(type)}
        />

        <CommentsSection contentType="poll" contentId={poll.id} />
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete poll?"
        description="This action cannot be undone. This will permanently delete your poll, all votes, and comments."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
