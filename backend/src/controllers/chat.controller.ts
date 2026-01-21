import type { Request, Response } from "express";
import type {
  CreateMessageSchemaType,
  UpdateMessageSchemaType,
  GetMessagesQuerySchemaType,
} from "../schemas/chat.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { ChatService } from "../services/chat.service.js";

// =========================
// SEND MESSAGE
// =========================
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const messageData = req.body as CreateMessageSchemaType;
  const formattedMessage = await ChatService.sendMessage(userId, messageData);

  return res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: formattedMessage,
  });
});

// =========================
// GET MESSAGES
// =========================
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  const query = req.query as unknown as GetMessagesQuerySchemaType;

  const result = await ChatService.getMessages(userId, query);

  return res.json({
    success: true,
    data: result.messages,
    pagination: result.pagination,
  });
});

// =========================
// EDIT MESSAGE
// =========================
export const editMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }
  if (!id) {
    throw new AppError("Message ID is required", 400);
  }

  const updates = req.body as UpdateMessageSchemaType;
  const result = await ChatService.editMessage(userId, id, updates);

  return res.json({
    success: true,
    message: result.message,
    data: result.data,
  });
});

// =========================
// DELETE MESSAGE
// =========================
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }
  if (!id) {
    throw new AppError("Message ID is required", 400);
  }

  await ChatService.deleteMessage(userId, id);

  return res.json({
    success: true,
    message: "Message deleted successfully",
  });
});

// =========================
// MARK AS READ
// =========================
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { lastReadMessageId } = req.body as { lastReadMessageId: string };
  const data = await ChatService.markAsRead(userId, lastReadMessageId);

  return res.json({
    success: true,
    message: "Messages marked as read",
    data,
  });
});
