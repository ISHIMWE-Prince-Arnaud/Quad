import type { Request, Response } from "express";
import { Bookmark } from "../models/Bookmark.model.js";
import type {
  BookmarkParamsSchemaType,
  CreateBookmarkSchemaType,
  GetBookmarksQuerySchemaType,
} from "../schemas/bookmark.schema.js";
import { getBookmarksQuerySchema } from "../schemas/bookmark.schema.js";
import { logger } from "../utils/logger.util.js";

export const createBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { contentType, contentId } = req.body as CreateBookmarkSchemaType;

    const existing = await Bookmark.findOne({ userId, contentType, contentId });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        data: null,
        bookmarked: false,
      });
    }

    const created = await Bookmark.create({ userId, contentType, contentId });
    return res.status(201).json({
      success: true,
      data: created,
      bookmarked: true,
    });
  } catch (error: unknown) {
    logger.error("Error toggling bookmark", error);
    const message = error instanceof Error ? error.message : "Server error";
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: message });
  }
};

export const removeBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { contentType, contentId } = req.params as unknown as BookmarkParamsSchemaType;

    await Bookmark.deleteOne({ userId, contentType, contentId });

    return res.status(200).json({
      success: true,
      message: "Bookmark removed",
    });
  } catch (error: unknown) {
    logger.error("Error removing bookmark", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const parsedQuery = getBookmarksQuerySchema.parse(req.query);
    const query = parsedQuery as GetBookmarksQuerySchemaType;
    const { page, limit, contentType } = query;

    const filter: Record<string, unknown> = { userId };
    if (contentType) filter.contentType = contentType;

    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      Bookmark.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Bookmark.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: bookmarks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error("Error fetching bookmarks", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { contentType, contentId } = req.params as unknown as BookmarkParamsSchemaType;

    const exists = await Bookmark.exists({ userId, contentType, contentId });

    return res.json({
      success: true,
      data: { bookmarked: !!exists },
    });
  } catch (error: unknown) {
    logger.error("Error checking bookmark", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
