import { endpoints } from "@/lib/api";

export type BookmarkContentType = "post" | "story" | "poll";

type BookmarkRecord = {
  _id: string;
  userId: string;
  contentType: BookmarkContentType;
  contentId: string;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasMore: boolean;
};

export class BookmarkService {
  static async toggle(contentType: BookmarkContentType, contentId: string): Promise<boolean> {
    const res = await endpoints.bookmarks.toggle({ contentType, contentId });
    return Boolean(res.data?.bookmarked);
  }

  static async isBookmarked(contentType: BookmarkContentType, contentId: string): Promise<boolean> {
    const res = await endpoints.bookmarks.check(contentType, contentId);
    return Boolean(res.data?.data?.bookmarked);
  }

  static async list(params?: {
    page?: number;
    limit?: number;
    contentType?: BookmarkContentType;
  }): Promise<{ success: boolean; data: BookmarkRecord[]; pagination?: Pagination }> {
    const res = await endpoints.bookmarks.list(params);
    return res.data;
  }
}
