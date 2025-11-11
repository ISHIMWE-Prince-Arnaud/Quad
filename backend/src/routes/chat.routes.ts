import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { validateSchema } from "../utils/validation.util.js";
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
  requireAuth(),
  validateSchema(createMessageSchema, "body"),
  sendMessage
);

// Get messages (with pagination)
router.get(
  "/messages",
  requireAuth(),
  validateSchema(getMessagesQuerySchema, "query"),
  getMessages
);

// Edit message
router.put(
  "/messages/:id",
  requireAuth(),
  validateSchema(messageIdSchema, "params"),
  validateSchema(updateMessageSchema, "body"),
  editMessage
);

// Delete message
router.delete(
  "/messages/:id",
  requireAuth(),
  validateSchema(messageIdSchema, "params"),
  deleteMessage
);

// ===========================
// REACTION ROUTES
// ===========================

// Add reaction
router.post(
  "/messages/:id/reactions",
  requireAuth(),
  validateSchema(messageIdSchema, "params"),
  validateSchema(addReactionSchema, "body"),
  addReaction
);

// Remove reaction
router.delete(
  "/messages/:id/reactions",
  requireAuth(),
  validateSchema(messageIdSchema, "params"),
  removeReaction
);

// ===========================
// READ RECEIPT ROUTES
// ===========================

// Mark messages as read
router.post(
  "/read",
  requireAuth(),
  validateSchema(markAsReadSchema, "body"),
  markAsRead
);

export default router;
