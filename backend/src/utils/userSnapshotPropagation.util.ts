import type { ClientSession, UpdateResult } from "mongoose";

import { ChatMessage } from "../models/ChatMessage.model.js";
import { Comment } from "../models/Comment.model.js";
import { CommentLike } from "../models/CommentLike.model.js";
import { Poll } from "../models/Poll.model.js";
import { Post } from "../models/Post.model.js";
import { Reaction } from "../models/Reaction.model.js";
import { Story } from "../models/Story.model.js";
import { logger } from "./logger.util.js";

type MaybeNull<T> = T | null | undefined;

export type UserSnapshotSource = {
  clerkId: string;
  username: string;
  email: string;
  displayName?: MaybeNull<string>;
  firstName?: MaybeNull<string>;
  lastName?: MaybeNull<string>;
  profileImage?: MaybeNull<string>;
  coverImage?: MaybeNull<string>;
  bio?: MaybeNull<string>;
};

function withMaybeNull(
  setOps: Record<string, unknown>,
  unsetOps: Record<string, "">,
  path: string,
  value: MaybeNull<unknown>
) {
  if (value === undefined) return;

  if (value === null) {
    unsetOps[path] = "";
    return;
  }

  setOps[path] = value;
}

function getModifiedCount(result: UpdateResult | { modifiedCount?: number } | unknown): number {
  if (typeof result === "object" && result !== null && "modifiedCount" in result) {
    const value = (result as { modifiedCount?: unknown }).modifiedCount;
    return typeof value === "number" ? value : 0;
  }

  return 0;
}

export async function propagateUserSnapshotUpdates(
  user: UserSnapshotSource,
  options?: {
    session?: ClientSession;
  }
): Promise<{
  postsModified: number;
  storiesModified: number;
  pollsModified: number;
  chatMessagesModified: number;
  commentsModified: number;
  reactionsModified: number;
  commentLikesModified: number;
}> {
  const session = options?.session;
  const updateOptions = session ? { session } : {};
  const setAuthorOps: Record<string, unknown> = {};
  const unsetAuthorOps: Record<string, ""> = {};

  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.username", user.username);
  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.email", user.email);
  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.profileImage", user.profileImage);
  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.coverImage", user.coverImage);
  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.bio", user.bio);
  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.firstName", user.firstName);
  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.lastName", user.lastName);
  withMaybeNull(setAuthorOps, unsetAuthorOps, "author.displayName", user.displayName);

  const authorUpdate = {
    ...(Object.keys(setAuthorOps).length ? { $set: setAuthorOps } : {}),
    ...(Object.keys(unsetAuthorOps).length ? { $unset: unsetAuthorOps } : {}),
  };

  const setCommentAuthorOps: Record<string, unknown> = {};
  const unsetCommentAuthorOps: Record<string, ""> = {};

  withMaybeNull(setCommentAuthorOps, unsetCommentAuthorOps, "author.username", user.username);
  withMaybeNull(setCommentAuthorOps, unsetCommentAuthorOps, "author.email", user.email);
  withMaybeNull(setCommentAuthorOps, unsetCommentAuthorOps, "author.profileImage", user.profileImage);

  const commentAuthorUpdate = {
    ...(Object.keys(setCommentAuthorOps).length ? { $set: setCommentAuthorOps } : {}),
    ...(Object.keys(unsetCommentAuthorOps).length ? { $unset: unsetCommentAuthorOps } : {}),
  };

  const setReactionOps: Record<string, unknown> = {};
  const unsetReactionOps: Record<string, ""> = {};
  withMaybeNull(setReactionOps, unsetReactionOps, "username", user.username);
  withMaybeNull(setReactionOps, unsetReactionOps, "profileImage", user.profileImage);

  const reactionUpdate = {
    ...(Object.keys(setReactionOps).length ? { $set: setReactionOps } : {}),
    ...(Object.keys(unsetReactionOps).length ? { $unset: unsetReactionOps } : {}),
  };

  const setCommentLikeOps: Record<string, unknown> = {};
  withMaybeNull(setCommentLikeOps, {}, "username", user.username);
  const commentLikeUpdate = {
    ...(Object.keys(setCommentLikeOps).length ? { $set: setCommentLikeOps } : {}),
  };

  if (!Object.keys(authorUpdate).length) {
    return {
      postsModified: 0,
      storiesModified: 0,
      pollsModified: 0,
      chatMessagesModified: 0,
      commentsModified: 0,
      reactionsModified: 0,
      commentLikesModified: 0,
    };
  }

  try {
    const [
      postsResult,
      storiesResult,
      pollsResult,
      chatMessagesResult,
      commentsResult,
      reactionsResult,
      commentLikesResult,
    ] = await Promise.all([
      Post.updateMany(
        { $or: [{ userId: user.clerkId }, { "author.clerkId": user.clerkId }] },
        authorUpdate,
        updateOptions
      ),
      Story.updateMany(
        { $or: [{ userId: user.clerkId }, { "author.clerkId": user.clerkId }] },
        authorUpdate,
        updateOptions
      ),
      Poll.updateMany({ "author.clerkId": user.clerkId }, authorUpdate, updateOptions),
      ChatMessage.updateMany({ "author.clerkId": user.clerkId }, authorUpdate, updateOptions),
      Comment.updateMany({ "author.clerkId": user.clerkId }, commentAuthorUpdate, updateOptions),
      Reaction.updateMany({ userId: user.clerkId }, reactionUpdate, updateOptions),
      CommentLike.updateMany({ userId: user.clerkId }, commentLikeUpdate, updateOptions),
    ]);

    return {
      postsModified: getModifiedCount(postsResult),
      storiesModified: getModifiedCount(storiesResult),
      pollsModified: getModifiedCount(pollsResult),
      chatMessagesModified: getModifiedCount(chatMessagesResult),
      commentsModified: getModifiedCount(commentsResult),
      reactionsModified: getModifiedCount(reactionsResult),
      commentLikesModified: getModifiedCount(commentLikesResult),
    };
  } catch (error: unknown) {
    logger.error("Failed to propagate user snapshot updates", {
      error,
      clerkId: user.clerkId,
    });

    throw error;
  }
}
