import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { Post } from "@/types/post";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
    reactionCounts,
    selectedEmoji,
    selectReaction,
  } = usePostReactions(post._id);

  const { bookmarked, toggleBookmark } = usePostBookmark(post._id);

  const { firstName, lastName, username } = post.author;

  const displayName =
    // Prefer full name when available (optional on author)
    firstName && lastName ? `${firstName} ${lastName}` : firstName || username;

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
      const shareFn = (
        navigator as unknown as {
          share?: (data: {
            url?: string;
            title?: string;
            text?: string;
          }) => Promise<void>;
        }
      ).share;
      if (typeof shareFn === "function") {
        await shareFn({ url, title: "Quad Post" });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Post link copied to clipboard");
      }
    } catch (e) {
      console.error("Failed to copy link:", e);
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
            "w-full transition-shadow duration-200",
            "hover:shadow-lg",
            className
          )}>
          <CardHeader className="pb-4">
            {/* Author info */}
            {/* More options */}
            <PostCardHeader
              post={post}
              displayName={displayName}
              isOwner={isOwner}
              onCopyLink={() => void handleCopyLink()}
              onEdit={handleEdit}
              onRequestDelete={() => setIsDeleteDialogOpen(true)}
            />
          </CardHeader>

          {/* Post content */}
          <CardContent className="pb-4 space-y-4">
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
            className="pt-3 pb-4 flex items-center gap-2 border-t"
            role="group"
            aria-label="Post actions">
            <PostCardFooter
              postId={post._id}
              commentsCount={post.commentsCount || 0}
              bookmarked={bookmarked}
              onToggleBookmark={toggleBookmark}
              onCopyLink={() => void handleCopyLink()}
              userReaction={userReaction}
              reactionPending={reactionPending}
              selectedEmoji={selectedEmoji}
              reactionCount={safeReactionCount}
              reactionCounts={reactionCounts}
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
