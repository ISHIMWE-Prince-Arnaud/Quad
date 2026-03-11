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

/**
 * @swagger
 * /chat/messages:
 *   post:
 *     summary: Send a direct message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post(
  "/messages",
  requireApiAuth,
  validateSchema(createMessageSchema, "body"),
  sendMessage,
);

/**
 * @swagger
 * /chat/messages:
 *   get:
 *     summary: Get message history with a user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
  "/messages",
  requireApiAuth,
  validateSchema(getMessagesQuerySchema, "query"),
  getMessages,
);

/**
 * @swagger
 * /chat/messages/{id}:
 *   put:
 *     summary: Edit a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated
 */
router.put(
  "/messages/:id",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  validateSchema(updateMessageSchema, "body"),
  editMessage,
);

/**
 * @swagger
 * /chat/messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete(
  "/messages/:id",
  requireApiAuth,
  validateSchema(messageIdSchema, "params"),
  deleteMessage,
);

export default router;
