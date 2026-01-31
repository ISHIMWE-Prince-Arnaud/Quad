import { endpoints } from "@/lib/api";
import type {
  ApiProfile,
  ProfileUpdateData,
  ContentItem,
  PaginationParams,
  ApiPost,
  ApiStory,
  ApiPoll,
} from "@/types/api";
import type { Post } from "@/types/post";
import type { Story } from "@/types/story";
import type { Poll } from "@/types/poll";

export class ProfileService {
  // Get user profile by username
  static async getProfileByUsername(username: string): Promise<ApiProfile> {
    const response = await endpoints.profiles.getByUsername(username);
    return response.data.data;
  }

  // Get user profile by ID
  static async getProfileById(userId: string): Promise<ApiProfile> {
    const response = await endpoints.profiles.getById(userId);
    return response.data.data;
  }

  // Update own profile
  static async updateProfile(
    username: string,
    data: ProfileUpdateData,
  ): Promise<ApiProfile> {
    const response = await endpoints.profiles.updateOwn(username, data);
    return response.data.data;
  }

  // Get user's posts
  static async getUserPosts(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ posts: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPosts(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawPosts: ApiPost[] = Array.isArray(rawData)
      ? (rawData as ApiPost[])
      : [];
    const pagination = response.data.pagination || {};

    // Transform posts to ContentItem format
    const posts: ContentItem[] = rawPosts.map((post: ApiPost) => ({
      _id: post._id,
      type: "post" as const,
      author: post.author,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      // Prefer backend text, fall back to legacy content
      text: post.text ?? post.content ?? "",
      content: post.text ?? post.content ?? "",
      media: post.media,
      reactionsCount: post.reactionsCount,
      commentsCount: post.commentsCount,
    }));

    return {
      posts,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawPosts.length,
    };
  }

  static async getUserPostsAsPosts(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ posts: Post[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPosts(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawPosts: ApiPost[] = Array.isArray(rawData)
      ? (rawData as ApiPost[])
      : [];
    const pagination = response.data.pagination || {};

    const posts: Post[] = rawPosts.map((post) => ({
      _id: post._id,
      userId: post.userId ?? post.clerkId ?? post.author?.clerkId ?? "",
      author: {
        clerkId: post.author.clerkId,
        username: post.author.username,
        email: post.author.email,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        profileImage: post.author.profileImage,
      },
      text: post.text ?? post.content,
      media: Array.isArray(post.media) ? post.media : [],
      reactionsCount: post.reactionsCount ?? 0,
      commentsCount: post.commentsCount ?? 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));

    return {
      posts,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawPosts.length,
    };
  }

  // Get user's stories
  static async getUserStories(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ stories: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserStories(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawStories: ApiStory[] = Array.isArray(rawData)
      ? (rawData as ApiStory[])
      : [];
    const pagination = response.data.pagination || {};

    // Transform stories to ContentItem format
    const stories: ContentItem[] = rawStories.map((story: ApiStory) => ({
      _id: story._id,
      type: "story" as const,
      content: story.content || "",
      author: story.author,
      createdAt: story.createdAt,
      views: story.views,
      images: story.media ? [story.media] : undefined,
    }));

    return {
      stories,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawStories.length,
    };
  }

  static async getUserStoriesAsStories(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ stories: Story[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserStories(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawStories: Story[] = Array.isArray(rawData)
      ? (rawData as Story[])
      : [];
    const pagination = response.data.pagination || {};

    return {
      stories: rawStories,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawStories.length,
    };
  }

  // Get user's polls
  static async getUserPolls(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ polls: ContentItem[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPolls(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawPolls: ApiPoll[] = Array.isArray(rawData)
      ? (rawData as ApiPoll[])
      : [];
    const pagination = response.data.pagination || {};

    // Transform polls to ContentItem format
    const polls: ContentItem[] = rawPolls.map((poll: ApiPoll) => ({
      _id: poll._id,
      type: "poll" as const,
      content: poll.question,
      question: poll.question,
      author: poll.author,
      createdAt: poll.createdAt,
      totalVotes: poll.totalVotes,
    }));

    return {
      polls,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawPolls.length,
    };
  }

  static async getUserPollsAsPolls(
    username: string,
    params: PaginationParams = {},
  ): Promise<{ polls: Poll[]; hasMore: boolean; total: number }> {
    const response = await endpoints.profiles.getUserPolls(username, {
      page: params.page || 1,
      limit: params.limit || 20,
      ...params,
    });

    const rawData = response.data?.data;
    const rawPolls: Array<Record<string, unknown>> = Array.isArray(rawData)
      ? (rawData as Array<Record<string, unknown>>)
      : [];
    const pagination = response.data.pagination || {};

    const polls: Poll[] = rawPolls
      .map((poll): Poll | null => {
        const idRaw = poll.id;
        const _idRaw = poll._id;
        const id =
          (typeof idRaw === "string" && idRaw) ||
          (typeof _idRaw === "string" && _idRaw) ||
          "";

        const author = poll.author as Poll["author"] | undefined;
        const question = poll.question as string | undefined;

        if (!id || !author || !question) return null;

        const optionsRaw = Array.isArray(poll.options)
          ? (poll.options as Array<Record<string, unknown>>)
          : [];

        const options = optionsRaw.map((opt, idx) => {
          const text = (opt.text as string | undefined) ?? "";
          const votesCount =
            typeof opt.votesCount === "number" ? opt.votesCount : undefined;
          const percentage =
            typeof opt.percentage === "number" ? opt.percentage : undefined;
          const index = typeof opt.index === "number" ? opt.index : idx;

          return {
            index,
            text,
            ...(typeof votesCount === "number" ? { votesCount } : {}),
            ...(typeof percentage === "number" ? { percentage } : {}),
          };
        });

        const settingsRaw = poll.settings as
          | Record<string, unknown>
          | undefined;
        const anonymousVoting =
          typeof settingsRaw?.anonymousVoting === "boolean"
            ? settingsRaw.anonymousVoting
            : false;

        const userVoteRaw = poll.userVote;
        const userVote = Array.isArray(userVoteRaw)
          ? (userVoteRaw as number[])
          : [];

        return {
          id,
          author,
          question,
          questionMedia: poll.questionMedia as Poll["questionMedia"],
          options,
          settings: { anonymousVoting },
          status: (poll.status as Poll["status"]) ?? "active",
          expiresAt: (poll.expiresAt as string | null | undefined) ?? null,
          totalVotes: (poll.totalVotes as number | undefined) ?? 0,
          reactionsCount: (poll.reactionsCount as number | undefined) ?? 0,
          userVote,
          canViewResults: Boolean(poll.canViewResults),
          createdAt:
            (poll.createdAt as string | undefined) ?? new Date().toISOString(),
          updatedAt:
            (poll.updatedAt as string | undefined) ?? new Date().toISOString(),
        };
      })
      .filter((p): p is Poll => Boolean(p));

    return {
      polls,
      hasMore: pagination.hasMore || false,
      total: pagination.total || rawPolls.length,
    };
  }

  // Get user content by type
  static async getUserContent(
    username: string,
    type: "posts" | "stories" | "polls",
    params: PaginationParams = {},
  ): Promise<{ items: ContentItem[]; hasMore: boolean; total: number }> {
    switch (type) {
      case "posts": {
        const result = await this.getUserPosts(username, params);
        return {
          items: result.posts,
          hasMore: result.hasMore,
          total: result.total,
        };
      }
      case "stories": {
        const result = await this.getUserStories(username, params);
        return {
          items: result.stories,
          hasMore: result.hasMore,
          total: result.total,
        };
      }
      case "polls": {
        const result = await this.getUserPolls(username, params);
        return {
          items: result.polls,
          hasMore: result.hasMore,
          total: result.total,
        };
      }
      default:
        throw new Error(`Unsupported content type: ${type}`);
    }
  }
}
