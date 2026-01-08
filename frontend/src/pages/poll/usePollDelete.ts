import { useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";

import { PollService } from "@/services/pollService";
import { logError } from "@/lib/errorHandling";

import { getErrorMessage } from "./getErrorMessage";

export function usePollDelete({
  id,
  navigate,
}: {
  id: string | undefined;
  navigate: NavigateFunction;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      const res = await PollService.delete(id);
      if (res.success) {
        toast.success("Poll deleted successfully");
        navigate("/app/polls");
      } else {
        toast.error(res.message || "Failed to delete poll");
      }
    } catch (err) {
      logError(err, { component: "PollDelete", action: "deletePoll", metadata: { id } });
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleting,
    handleDelete,
  };
}
