import { Router } from "express";

import {
  checkBookmark,
  createBookmark,
  getBookmarks,
  removeBookmark,
} from "../controllers/bookmark.controller.js";

import {
  bookmarkParamsSchema,
  createBookmarkSchema,
  getBookmarksQuerySchema,
} from "../schemas/bookmark.schema.js";

import { requireApiAuth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../utils/validation.util.js";

const router = Router();

router.post("/", requireApiAuth, validateSchema(createBookmarkSchema), createBookmark);

router.get("/", requireApiAuth, validateSchema(getBookmarksQuerySchema, "query"), getBookmarks);

router.get(
  "/:contentType/:contentId/check",
  requireApiAuth,
  validateSchema(bookmarkParamsSchema, "params"),
  checkBookmark
);

router.delete(
  "/:contentType/:contentId",
  requireApiAuth,
  validateSchema(bookmarkParamsSchema, "params"),
  removeBookmark
);

export default router;
