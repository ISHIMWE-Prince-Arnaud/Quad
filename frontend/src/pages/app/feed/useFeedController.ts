import { useCallback, useEffect, useState } from "react";
import { showSuccessToast, showErrorToast } from "@/lib/error-handling/toasts";

import { getSocket } from "@/lib/socket";
import type {
  FeedContentDeletedPayload,
  FeedEngagementUpdatePayload,
  PollVotedPayload,
} from "@/lib/socket";
import { FeedService } from "@/services/feedService";
import { PollService } from "@/services/pollService";
import { PostService } from "@/services/postService";
import type { FeedItem, FeedTab, FeedType } from "@/types/feed";
import type { Post } from "@/types/post";
import type { Poll } from "@/types/poll";
import { logError } from "@/lib/errorHandling";
import { useAuthStore } from "@/stores/authStore";
import type { CreatePostData } from "@/schemas/post.schema";

import { getErrorMessage } from "./feedError";
import {
  dedupeFeedItems,
  filterFeedItemsForTab,
  mixPostsAndPolls,
} from "./feedUtils";

export function useFeedController({
  feedType,
  tab,
}: {
  feedType: FeedType;
  tab: FeedTab;
}) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [mixPatternIndex, setMixPatternIndex] = useState(0);

  const normalizeItems = useCallback(
    (rawItems: FeedItem[], startIndex: number) => {
      const dedupedItems = dedupeFeedItems(rawItems || []);
      const tabFiltered = filterFeedItemsForTab(dedupedItems, tab);

      if (tab === "home") {
        return mixPostsAndPolls(tabFiltered, startIndex);
      }

      return { items: tabFiltered, nextPatternIndex: 0 };
    },
    [tab],
  );

  const handleRefreshFeed = useCallback(async () => {
    if (loading) return;
    setLastSeenId(null);
    setNewCount(0);

    try {
      setLoading(true);
      setError(null);
      setMixPatternIndex(0);

      const response = await FeedService.getFeed(feedType, {
        tab,
        limit: 20,
        sort: "newest",
      });

      if (!response.success) {
        setError(response.message || "Failed to refresh feed");
        return;
      }

      const data = response.data;
      const normalized = normalizeItems(data.items || [], 0);
      setItems(normalized.items);
      setMixPatternIndex(normalized.nextPatternIndex);
      setCursor(data.pagination.nextCursor || null);
      setHasMore(Boolean(data.pagination.hasMore));
      setLastSeenId(
        normalized.items.length > 0 ? String(normalized.items[0]._id) : null,
      );
    } catch (err: unknown) {
      logError(err, {
        component: "FeedController",
        action: "refreshFeed",
        metadata: { feedType, tab },
      });
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [feedType, loading, normalizeItems, tab]);

  useEffect(() => {
    let isCancelled = false;

    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        setItems([]);
        setCursor(null);
        setHasMore(true);
        setNewCount(0);
        setMixPatternIndex(0);

        const response = await FeedService.getFeed(feedType, {
          tab,
          limit: 20,
          sort: "newest",
        });

        if (!response.success) {
          if (!isCancelled) {
            setError(response.message || "Failed to load feed");
          }
          return;
        }

        const data = response.data;
        if (!data || !Array.isArray(data.items)) {
          if (!isCancelled) {
            setError("Unexpected feed response");
          }
          return;
        }

        if (!isCancelled) {
          const normalized = normalizeItems(data.items, 0);
          setItems(normalized.items);
          setMixPatternIndex(normalized.nextPatternIndex);
          setCursor(data.pagination.nextCursor || null);
          setHasMore(Boolean(data.pagination.hasMore));
          setLastSeenId(
            normalized.items.length > 0
              ? String(normalized.items[0]._id)
              : null,
          );
        }
      } catch (err: unknown) {
        logError(err, {
          component: "FeedController",
          action: "fetchFeed",
          metadata: { feedType, tab },
        });
        if (!isCancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchFeed();

    return () => {
      isCancelled = true;
    };
  }, [feedType, normalizeItems, tab]);

  useEffect(() => {
    if (!lastSeenId) return;

    const interval = setInterval(async () => {
      try {
        const response = await FeedService.getNewContentCount({
          feedType,
          tab,
          since: lastSeenId,
        });

        if (response.success && typeof response.data?.count === "number") {
          setNewCount(response.data.count);
        }
      } catch (err) {
        logError(err, {
          component: "FeedController",
          action: "fetchNewContentCount",
          metadata: { feedType, tab, lastSeenId },
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [feedType, tab, lastSeenId]);

  useEffect(() => {
    const socket = getSocket();

    const handleNewContent = async () => {
      if (!lastSeenId) return;

      const nearTop = window.scrollY < 120;
      if (nearTop && !loading) {
        void handleRefreshFeed();
        return;
      }

      try {
        const response = await FeedService.getNewContentCount({
          feedType,
          tab,
          since: lastSeenId,
        });

        if (response.success && typeof response.data?.count === "number") {
          setNewCount(response.data.count);
        }
      } catch (err) {
        logError(err, {
          component: "FeedController",
          action: "handleNewContent(socket)",
          metadata: { feedType, tab, lastSeenId },
        });
      }
    };

    const handleEngagementUpdate = (payload: FeedEngagementUpdatePayload) => {
      setItems((prev) =>
        prev.map((it) => {
          const sameItem = String(it._id) === String(payload.contentId);

          if (payload.contentType === "post" && it.type === "post") {
            const content = it.content as Post;
            const sameContent =
              String(content._id) === String(payload.contentId);
            if (sameItem || sameContent) {
              return {
                ...it,
                content: {
                  ...content,
                  reactionsCount:
                    payload.reactionsCount ?? content.reactionsCount,
                  commentsCount: payload.commentsCount ?? content.commentsCount,
                },
                engagementMetrics: {
                  ...it.engagementMetrics,
                  reactions:
                    payload.reactionsCount ?? it.engagementMetrics.reactions,
                  comments:
                    payload.commentsCount ?? it.engagementMetrics.comments,
                },
              } as FeedItem;
            }
          }

          if (payload.contentType === "poll" && it.type === "poll") {
            if (sameItem) {
              const poll = it.content as Poll;
              const updatedPoll = { ...poll };

              // Update total votes if provided
              if (typeof payload.votes === "number") {
                updatedPoll.totalVotes = payload.votes;
              }

              // Update reactions count if provided
              if (typeof payload.reactionsCount === "number") {
                updatedPoll.reactionsCount = payload.reactionsCount;
              }

              return {
                ...it,
                content: updatedPoll,
                engagementMetrics: {
                  ...it.engagementMetrics,
                  votes: payload.votes ?? it.engagementMetrics.votes,
                  reactions:
                    payload.reactionsCount ?? it.engagementMetrics.reactions,
                },
              } as FeedItem;
            }
          }

          return it;
        }),
      );
    };

    const handleContentDeleted = (payload: FeedContentDeletedPayload) => {
      setItems((prev) =>
        prev.filter((it) => {
          if (String(it._id) === String(payload.contentId)) return false;
          if (it.type === "post") {
            const content = it.content as Post;
            if (String(content._id) === String(payload.contentId)) return false;
          }
          return true;
        }),
      );
    };

    const handlePollVoted = (payload: PollVotedPayload) => {
      if (!payload?.pollId) return;

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.type === "poll") {
            const poll = item.content as Poll;
            if (String(poll.id) !== String(payload.pollId)) return item;

            const totalVotes =
              typeof payload.totalVotes === "number"
                ? payload.totalVotes
                : poll.totalVotes;

            const options = poll.options.map((opt, idx) => {
              const optionIndex =
                typeof opt.index === "number" ? opt.index : idx;
              const votesCountRaw = payload.updatedVoteCounts?.[optionIndex];
              const votesCount =
                typeof votesCountRaw === "number"
                  ? votesCountRaw
                  : (opt.votesCount ?? 0);

              return {
                ...opt,
                votesCount,
                percentage:
                  totalVotes > 0
                    ? Math.round((votesCount / totalVotes) * 100)
                    : 0,
              };
            });

            return {
              ...item,
              content: {
                ...poll,
                totalVotes,
                options,
              },
              engagementMetrics: {
                ...item.engagementMetrics,
                votes: totalVotes,
              },
            } as FeedItem;
          }
          return item;
        }),
      );
    };

    socket.on("feed:new-content", handleNewContent);
    socket.on("feed:engagement-update", handleEngagementUpdate);
    socket.on("feed:content-deleted", handleContentDeleted);
    socket.on("pollVoted", handlePollVoted);

    return () => {
      socket.off("feed:new-content", handleNewContent);
      socket.off("feed:engagement-update", handleEngagementUpdate);
      socket.off("feed:content-deleted", handleContentDeleted);
      socket.off("pollVoted", handlePollVoted);
    };
  }, [feedType, handleRefreshFeed, lastSeenId, loading, tab]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await FeedService.getFeed(feedType, {
        tab,
        cursor,
        limit: 20,
        sort: "newest",
      });

      if (!response.success) {
        showErrorToast(response.message || "Failed to load more content");
        return;
      }

      const data = response.data;
      const normalized = normalizeItems(data.items || [], mixPatternIndex);
      setItems((prev) => dedupeFeedItems([...prev, ...normalized.items]));
      setMixPatternIndex(normalized.nextPatternIndex);
      setCursor(data.pagination.nextCursor || null);
      setHasMore(Boolean(data.pagination.hasMore));
    } catch (err: unknown) {
      logError(err, {
        component: "FeedController",
        action: "loadMore",
        metadata: { feedType, tab, cursor },
      });
      showErrorToast(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  }, [
    cursor,
    feedType,
    hasMore,
    loadingMore,
    mixPatternIndex,
    normalizeItems,
    tab,
  ]);

  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const response = await PostService.deletePost(postId);

      if (response.success) {
        setItems((prev) =>
          prev.filter((item) => {
            if (item.type !== "post") return true;
            const content = item.content as Post;
            return content._id !== postId;
          }),
        );
        showSuccessToast("Post deleted");
      } else {
        showErrorToast(response.message || "Failed to delete post");
      }
    } catch (err: unknown) {
      logError(err, {
        component: "FeedController",
        action: "deletePost",
        metadata: { postId },
      });
      showErrorToast(getErrorMessage(err));
    }
  }, []);

  const handleDeletePoll = useCallback(async (pollId: string) => {
    try {
      const response = await PollService.delete(pollId);

      if (response.success) {
        setItems((prev) =>
          prev.filter((item) => {
            if (item.type !== "poll") return true;
            if (String(item._id) === String(pollId)) return false;
            const content = item.content as Poll;
            const contentId =
              (content as unknown as { id?: string; _id?: string }).id ??
              (content as unknown as { id?: string; _id?: string })._id;
            return String(contentId) !== String(pollId);
          }),
        );
        showSuccessToast("Poll deleted");
      } else {
        showErrorToast(response.message || "Failed to delete poll");
      }
    } catch (err: unknown) {
      logError(err, {
        component: "FeedController",
        action: "deletePoll",
        metadata: { pollId },
      });
      showErrorToast(getErrorMessage(err));
    }
  }, []);

  const handleCreatePost = useCallback(
    async (payload: { text?: string; media: CreatePostData["media"] }) => {
      const canShowPost = tab === "home" || tab === "posts";

      if (!Array.isArray(payload.media) || payload.media.length === 0) {
        showErrorToast("Post must have at least one media");
        return;
      }

      const authUser = useAuthStore.getState().user;
      const optimisticId = `optimistic:${Date.now()}`;

      const optimisticPost: Post = {
        _id: optimisticId,
        userId: authUser?._id || authUser?.clerkId || "",
        author: {
          clerkId: authUser?.clerkId || "",
          username: authUser?.username || "user",
          email: authUser?.email || "",
          firstName: authUser?.firstName,
          lastName: authUser?.lastName,
          profileImage: authUser?.profileImage,
        },
        ...(typeof payload.text === "string" && payload.text.trim().length > 0
          ? { text: payload.text }
          : {}),
        media: payload.media,
        reactionsCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const optimisticItem: FeedItem = {
        _id: optimisticId,
        type: "post",
        content: optimisticPost,
        score: 0,
        priority: feedType === "following" ? "following" : "discover",
        createdAt: new Date().toISOString(),
        engagementMetrics: { reactions: 0, comments: 0, votes: 0 },
        author: {
          clerkId: optimisticPost.author.clerkId,
          username: optimisticPost.author.username,
          profileImage: optimisticPost.author.profileImage,
        },
      };

      try {
        setCreatingPost(true);

        if (canShowPost) {
          setItems((prev) => [optimisticItem, ...prev]);
        }

        const res = await PostService.createPost({
          ...(typeof payload.text === "string" && payload.text.trim().length > 0
            ? { text: payload.text }
            : {}),
          media: payload.media,
        });

        if (!res.success) {
          throw new Error(res.message || "Failed to create post");
        }

        const created = res.data;
        const createdItem: FeedItem = {
          _id: created._id,
          type: "post",
          content: created,
          score: 0,
          priority: feedType === "following" ? "following" : "discover",
          createdAt: created.createdAt,
          engagementMetrics: {
            reactions: created.reactionsCount ?? 0,
            comments: created.commentsCount ?? 0,
            votes: 0,
          },
          author: {
            clerkId: created.author.clerkId,
            username: created.author.username,
            profileImage: created.author.profileImage,
          },
        };

        if (canShowPost) {
          setItems((prev) =>
            prev.map((it) => (it._id === optimisticId ? createdItem : it)),
          );
        }

        showSuccessToast("Posted");
      } catch (err: unknown) {
        logError(err, {
          component: "FeedController",
          action: "createPost",
          metadata: { feedType, tab },
        });

        if (canShowPost) {
          setItems((prev) => prev.filter((it) => it._id !== optimisticId));
        }
        showErrorToast(getErrorMessage(err));
      } finally {
        setCreatingPost(false);
      }
    },
    [feedType, tab],
  );

  return {
    items,
    hasMore,
    loading,
    loadingMore,
    creatingPost,
    error,
    newCount,
    handleRefreshFeed,
    handleLoadMore,
    handleDeletePost,
    handleDeletePoll,
    handleCreatePost,
  };
}
