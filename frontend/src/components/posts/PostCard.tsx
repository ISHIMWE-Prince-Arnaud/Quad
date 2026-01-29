import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn, copyToClipboard, getDisplayName } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Post } from "@/types/post";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { logError } from "@/lib/errorHandling";

import { MAX_PREVIEW_LENGTH } from "./post-card/constants";
import { PostCardBody } from "./post-card/PostCardBody";
import { PostCardFooter } from "./post-card/PostCardFooter";
import { PostCardHeader } from "./post-card/PostCardHeader";
import { usePostBookmark } from "./post-card/usePostBookmark";
import { usePostReactions } from "./post-card/usePostReactions";

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  className?: string;
  isSingleView?: boolean;
}

export function PostCard({
  post,
  onDelete,
  className,
  isSingleView = false,
}: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwner = user?.clerkId === post.author.clerkId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    userReaction,
    reactionPending,
    reactionCount,
    selectReaction,
  } = usePostReactions(post._id);

  const { bookmarked, bookmarkPending, toggleBookmark } = usePostBookmark(post._id);

  const displayName = getDisplayName(post.author);

  const fullText = post.text ?? "";
  const hasLongText = fullText.length > MAX_PREVIEW_LENGTH;
  const previewText = hasLongText
    ? `${fullText.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}...`
    : fullText;

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(post._id);
    setIsDeleteDialogOpen(false);
  };

  const handleCopyLink = async () => {
    const path = `/app/posts/${post._id}`;
    const url = `${window.location.origin}${path}`;

    try {
      const ok = await copyToClipboard(url);
      if (ok) {
        toast.success("Post link copied to clipboard");
      } else {
        toast.error("Failed to copy link");
      }
    } catch (e) {
      logError(e, {
        component: "PostCard",
        action: "copyLink",
        metadata: { postId: post._id },
      });
      toast.error("Failed to copy link");
    }
  };

  const handleEdit = () => {
    navigate(`/app/posts/${post._id}/edit`);
  };

  const safeReactionCount = reactionCount ?? post.reactionsCount ?? 0;

  return (
    <>
      <motion.div
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}>
        <Card
          className={cn(
            "w-full bg-[#0f121a] border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300",
            "hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-white/10",
            className
          )}>
          <CardHeader className="pb-4">
            {/* Author info */}
            {/* More options */}
            <PostCardHeader
              post={post}
              displayName={displayName}
              isOwner={isOwner}
              onEdit={handleEdit}
              onRequestDelete={() => setIsDeleteDialogOpen(true)}
            />
          </CardHeader>

          {/* Post content */}
          <CardContent className="px-6 pb-6 space-y-4">
            {/* Text content */}
            {/* Media gallery */}
            <PostCardBody
              postId={post._id}
              fullText={fullText}
              hasLongText={hasLongText}
              previewText={previewText}
              isSingleView={isSingleView}
              media={post.media}
            />
          </CardContent>

          {/* Interaction buttons */}
          <CardFooter
            className="px-6 py-4 flex items-center gap-2 border-t border-white/5 bg-white/[0.02]"
            role="group"
            aria-label="Post actions">
            <PostCardFooter
              postId={post._id}
              commentsCount={post.commentsCount || 0}
              bookmarked={bookmarked}
              bookmarkPending={bookmarkPending}
              onToggleBookmark={toggleBookmark}
              onCopyLink={() => void handleCopyLink()}
              userReaction={userReaction}
              reactionPending={reactionPending}
              reactionCount={safeReactionCount}
              onSelectReaction={(type) => void selectReaction(type)}
            />
          </CardFooter>
        </Card>
      </motion.div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete post?"
        description="This action cannot be undone. This will permanently delete your post and remove it from feeds."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
