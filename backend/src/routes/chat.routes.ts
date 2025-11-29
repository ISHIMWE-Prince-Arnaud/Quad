import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import {
  createMessageSchema,
  updateMessageSchema,
  addReactionSchema,
  messageIdSchema,
  getMessagesQuerySchema,
  markAsReadSchema,
} from "../schemas/chat.schema.js";
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  markAsRead,
} from "../controllers/chat.controller.js";

const router = Router();

// ===========================
// MESSAGE ROUTES
// ===========================

// Send message
router.post(
  "/messages",
  requireApiAuth,
  validateSchema(createMessageSchema, "body"),
  sendMessage
);

// Get messages (with pagination)
router.get(
  "/messages",
  requireApiAuth,
  validateSchema(getMessagesQuerySchema, "query"),
  getMessages
);

// Edit message
router.put(
  "/messages/:id",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  validateSchema(updateMessageSchema, "body"),
  editMessage
);

// Delete message
router.delete(
  "/messages/:id",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  deleteMessage
);

// ===========================
// REACTION ROUTES
// ===========================

// Add reaction
router.post(
  "/messages/:id/reactions",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  validateSchema(addReactionSchema, "body"),
  addReaction
);

// Remove reaction
router.delete(
  "/messages/:id/reactions",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  removeReaction
);

// ===========================
// READ RECEIPT ROUTES
// ===========================

// Mark messages as read
router.post(
  "/read",
  requireApiAuth,
  validateSchema(markAsReadSchema, "body"),
  markAsRead
);

export default router;
