import { Router } from "express";
import { validateSchema } from "../utils/validation.util.js";
import { requireApiAuth } from "../middlewares/auth.middleware.js";
import {
  createMessageSchema,
  updateMessageSchema,
  messageIdSchema,
  getMessagesQuerySchema,
} from "../schemas/chat.schema.js";
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
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
  sendMessage,
);

// Get messages (with pagination)
router.get(
  "/messages",
  requireApiAuth,
  validateSchema(getMessagesQuerySchema, "query"),
  getMessages,
);

// Edit message
router.put(
  "/messages/:id",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  validateSchema(updateMessageSchema, "body"),
  editMessage,
);

// Delete message
router.delete(
  "/messages/:id",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  deleteMessage,
);

export default router;
