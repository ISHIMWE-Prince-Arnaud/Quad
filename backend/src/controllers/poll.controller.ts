import type { Request, Response } from "express";
import type {
  CreatePollSchemaType,
  UpdatePollSchemaType,
  VoteOnPollSchemaType,
  GetPollsQuerySchemaType,
} from "../schemas/poll.schema.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { AppError } from "../utils/appError.util.js";
import { PollService } from "../services/poll.service.js";

// =========================
// CREATE POLL
// =========================
export const createPoll = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const pollData = req.body as CreatePollSchemaType;
  const poll = await PollService.createPoll(userId, pollData);

  return res.status(201).json({
    success: true,
    message: "Poll created successfully",
    data: poll,
  });
});

// =========================
// GET ALL POLLS
// =========================
export const getAllPolls = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  const query = req.query as unknown as GetPollsQuerySchemaType;

  const result = await PollService.getAllPolls(userId, query);

  return res.json({
    success: true,
    data: result.polls,
    pagination: result.pagination,
  });
});

// =========================
// GET POLL BY ID
// =========================
export const getPollById = asyncHandler(async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    throw new AppError("Poll ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const poll = await PollService.getPollById(userId, id);

  return res.json({
    success: true,
    data: poll,
  });
});

// =========================
// GET MY POLLS
// =========================
export const getMyPolls = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { page = 1, limit = 10 } = req.query as {
    page?: string | number;
    limit?: string | number;
  };

  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);

  const result = await PollService.getMyPolls(userId, pageNum, limitNum);

  return res.json({
    success: true,
    data: result.polls,
    pagination: result.pagination,
  });
});

// =========================
// UPDATE POLL
// =========================
export const updatePoll = asyncHandler(async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    throw new AppError("Poll ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const updates = req.body as UpdatePollSchemaType;
  const poll = await PollService.updatePoll(userId, id, updates);

  return res.json({
    success: true,
    message: "Poll updated successfully",
    data: poll,
  });
});

// =========================
// DELETE POLL
// =========================
export const deletePoll = asyncHandler(async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    throw new AppError("Poll ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  await PollService.deletePoll(userId, id);

  return res.json({
    success: true,
    message: "Poll deleted successfully",
  });
});

// =========================
// VOTE ON POLL
// =========================
export const voteOnPoll = asyncHandler(async (req: Request, res: Response) => {
  const idParam = req.params.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  if (!id) {
    throw new AppError("Poll ID is required", 400);
  }

  const userId = req.auth?.userId;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { optionIndices } = req.body as VoteOnPollSchemaType;
  const result = await PollService.voteOnPoll(userId, id, optionIndices);

  return res.json({
    success: true,
    message: "Vote recorded successfully",
    data: result.formattedPoll,
  });
});
