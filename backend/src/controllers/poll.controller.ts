/// <reference path="../types/global.d.ts" />
import type { Request, Response } from "express";
import { Poll, type IPollDocument } from "../models/Poll.model.js";
import { logger } from "../utils/logger.util.js";
import { PollVote } from "../models/PollVote.model.js";
import { User } from "../models/User.model.js";
import type {
  CreatePollSchemaType,
  UpdatePollSchemaType,
  VoteOnPollSchemaType,
  GetPollsQuerySchemaType,
} from "../schemas/poll.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import {
  emitContentDeleted,
  emitEngagementUpdate,
  emitNewContent,
} from "../sockets/feed.socket.js";
import {
  canVoteOnPoll,
  canViewResults,
  validateVoteIndices,
  formatPollResponse,
} from "../utils/poll.util.js";
import {
  createNotification,
  generateNotificationMessage,
} from "../utils/notification.util.js";

// =========================
// CREATE POLL
// =========================
export const createPoll = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const pollData = req.body as CreatePollSchemaType;

    // Get user info
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize options with vote counts
    const options = pollData.options.map((opt) => ({
      text: opt.text,
      media: opt.media,
      votesCount: 0,
    }));

    // Create poll
    const poll = await Poll.create({
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        bio: user.bio,
      },
      question: pollData.question,
      questionMedia: pollData.questionMedia,
      options,
      settings: pollData.settings || {
        allowMultiple: false,
        anonymousVoting: false,
        showResults: "afterVote",
      },
      status: "active",
      expiresAt: pollData.expiresAt,
      totalVotes: 0,
      reactionsCount: 0,
      commentsCount: 0,
    });

    // Emit real-time event
    const io = getSocketIO();
    io.emit("newPoll", poll);
    emitNewContent(io, "poll", String(poll._id), poll.author.clerkId);

    return res.status(201).json({
      success: true,
      message: "Poll created successfully",
      data: poll,
    });
  } catch (error: any) {
    logger.error("Error creating poll:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET ALL POLLS
// =========================
export const getAllPolls = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    const query = req.query as unknown as GetPollsQuerySchemaType;
    const { page, limit, status, author, voted, search, sort } = query;

    // Build filter
    const filter: any = {};

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Author filter
    if (author) {
      filter["author.clerkId"] = author;
    }

    // Search filter
    if (search) {
      filter.$text = { $search: search };
    }

    // Voting status filter (requires userId)
    if (voted !== undefined && userId) {
      const userVotes = await PollVote.find({ userId }).select("pollId");
      const votedPollIds = userVotes.map((v) => v.pollId);

      if (voted === true) {
        // Polls user voted on
        filter._id = { $in: votedPollIds };
      } else {
        // Polls user hasn't voted on
        filter._id = { $nin: votedPollIds };
      }
    }

    // Build sort
    let sortOption: any = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "trending":
        sortOption = { totalVotes: -1, createdAt: -1 };
        break;
      case "mostVotes":
        sortOption = { totalVotes: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [polls, total] = await Promise.all([
      Poll.find(filter).sort(sortOption).skip(skip).limit(limit),
      Poll.countDocuments(filter),
    ]);

    // Get user's votes if logged in
    let userVotes: any = {};
    if (userId) {
      const votes = await PollVote.find({
        userId,
        pollId: { $in: polls.map((p) => p._id) },
      });
      userVotes = Object.fromEntries(
        votes.map((v) => [v.pollId.toString(), v])
      );
    }

    // Format polls with appropriate data
    const formattedPolls = polls.map((poll) => {
      const pollId = poll._id ? poll._id.toString() : "";
      const userVote = userVotes[pollId];
      const hasVoted = !!userVote;
      const showResults = canViewResults(poll, hasVoted);

      return formatPollResponse(poll, userVote || undefined, showResults);
    });

    return res.json({
      success: true,
      data: formattedPolls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error("Error fetching polls:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET MY POLLS
// =========================
export const getMyPolls = async (req: Request, res: Response) => {
  try {
    const userId = req.auth.userId;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Find user's polls
    const [polls, total] = await Promise.all([
      Poll.find({ "author.clerkId": userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Poll.countDocuments({ "author.clerkId": userId }),
    ]);

    // Author can always see results
    const formattedPolls = polls.map((poll) =>
      formatPollResponse(poll, undefined, true)
    );

    return res.json({
      success: true,
      data: formattedPolls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum < Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    logger.error("Error fetching user polls:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GET SINGLE POLL
// =========================
export const getPoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth?.userId;

    // Find poll
    const poll = await Poll.findById(id);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Check if user voted
    let userVote = undefined;
    let hasVoted = false;

    if (userId) {
      const vote = await PollVote.findOne({ pollId: id, userId });
      if (vote) {
        userVote = vote;
        hasVoted = true;
      }
    }

    // Determine if results should be shown
    const showResults = canViewResults(poll, hasVoted);

    // Format response
    const formattedPoll = formatPollResponse(poll, userVote, showResults);

    return res.json({
      success: true,
      data: formattedPoll,
    });
  } catch (error: any) {
    logger.error("Error fetching poll:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// UPDATE POLL
// =========================
export const updatePoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;
    const updates = req.body as UpdatePollSchemaType;

    // Find poll
    const poll = await Poll.findById(id);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Only author can update
    if (poll.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the author can update this poll",
      });
    }

    // Can't update if closed
    if (poll.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a closed poll",
      });
    }

    // Apply updates (only question and questionMedia allowed)
    if (updates.question) {
      poll.question = updates.question;
    }
    if (updates.questionMedia !== undefined) {
      poll.questionMedia = updates.questionMedia as any;
    }

    await poll.save();

    // Emit real-time event
    getSocketIO().emit("pollUpdated", poll);

    return res.json({
      success: true,
      message: "Poll updated successfully",
      data: poll,
    });
  } catch (error: any) {
    logger.error("Error updating poll:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// DELETE POLL
// =========================
export const deletePoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Poll ID is required" });
    }
    const userId = req.auth.userId;

    // Find poll
    const poll = await Poll.findById(id);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Only author can delete
    if (poll.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the author can delete this poll",
      });
    }

    // Delete poll and all votes
    await Promise.all([
      Poll.findByIdAndDelete(id),
      PollVote.deleteMany({ pollId: id }),
    ]);

    // Emit real-time event
    const io = getSocketIO();
    io.emit("pollDeleted", id);
    emitContentDeleted(io, "poll", id);

    return res.json({
      success: true,
      message: "Poll deleted successfully",
    });
  } catch (error: any) {
    logger.error("Error deleting poll:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// VOTE ON POLL
// =========================
export const voteOnPoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Poll ID is required" });
    }
    const userId = req.auth.userId;
    const { optionIndices } = req.body as VoteOnPollSchemaType;

    // Find poll
    const poll = await Poll.findById(id);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Check if poll accepts votes
    if (!canVoteOnPoll(poll)) {
      return res.status(400).json({
        success: false,
        message: "This poll is not accepting votes",
      });
    }

    // Validate option indices
    const validation = validateVoteIndices(poll, optionIndices);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    // Check if user already voted
    const existingVote = await PollVote.findOne({ pollId: id, userId });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this poll",
      });
    }

    // Create vote
    const vote = await PollVote.create({
      pollId: id,
      userId,
      optionIndices,
      votedAt: new Date(),
    });

    // Update poll vote counts
    const previousTotalVotes = poll.totalVotes;
    optionIndices.forEach((index) => {
      if (poll.options[index]) {
        poll.options[index].votesCount += 1;
      }
    });
    poll.totalVotes += 1;
    const newTotalVotes = poll.totalVotes;
    await poll.save();

    // Check for milestone and notify poll owner
    const milestones = [10, 50, 100, 250, 500, 1000, 5000, 10000];
    const reachedMilestone = milestones.find(
      (milestone) =>
        previousTotalVotes < milestone && newTotalVotes >= milestone
    );

    if (reachedMilestone) {
      const pollOwnerId = poll.author.clerkId;
      const pollId = poll._id ? poll._id.toString() : id;
      if (pollOwnerId && pollId) {
        await createNotification({
          userId: pollOwnerId,
          type: "poll_milestone",
          contentId: pollId,
          contentType: "Poll",
          message: `Your poll reached ${reachedMilestone} votes!`,
        });
      }
    }

    // Emit real-time event (no user info for privacy)
    const io = getSocketIO();
    io.emit("pollVoted", {
      pollId: id,
      updatedVoteCounts: poll.options.map((opt) => opt.votesCount),
      totalVotes: poll.totalVotes,
    });
    emitEngagementUpdate(
      io,
      "poll",
      id,
      poll.reactionsCount,
      poll.commentsCount,
      poll.totalVotes
    );

    // Return updated poll with results visible
    const formattedPoll = formatPollResponse(poll, vote, true);

    return res.json({
      success: true,
      message: "Vote recorded successfully",
      data: formattedPoll,
    });
  } catch (error: any) {
    logger.error("Error voting on poll:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// REMOVE VOTE
// =========================
export const removeVote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Poll ID is required" });
    }
    const userId = req.auth.userId;

    // Find poll
    const poll = await Poll.findById(id);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Only author can remove votes
    if (poll.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the poll author can remove votes",
      });
    }

    // Find vote
    const vote = await PollVote.findOne({ pollId: id, userId });
    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "No vote found",
      });
    }

    // Update poll vote counts
    vote.optionIndices.forEach((index) => {
      if (poll.options[index]) {
        poll.options[index].votesCount -= 1;
      }
    });
    poll.totalVotes -= 1;

    // Delete vote and save poll
    await Promise.all([PollVote.findByIdAndDelete(vote._id), poll.save()]);

    const io = getSocketIO();
    emitEngagementUpdate(
      io,
      "poll",
      id,
      poll.reactionsCount,
      poll.commentsCount,
      poll.totalVotes
    );

    return res.json({
      success: true,
      message: "Vote removed successfully",
    });
  } catch (error: any) {
    logger.error("Error removing vote:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// CLOSE POLL
// =========================
export const closePoll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Poll ID is required" });
    }
    const userId = req.auth.userId;

    // Find poll
    const poll = await Poll.findById(id);
    if (!poll) {
      return res
        .status(404)
        .json({ success: false, message: "Poll not found" });
    }

    // Only author can close
    if (poll.author.clerkId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the author can close this poll",
      });
    }

    // Can't close if already closed or expired
    if (poll.status !== "active") {
      return res.status(400).json({
        success: false,
        message: `Poll is already ${poll.status}`,
      });
    }

    // Close poll
    poll.status = "closed";
    await poll.save();

    // Emit real-time event
    getSocketIO().emit("pollClosed", id);

    return res.json({
      success: true,
      message: "Poll closed successfully",
      data: poll,
    });
  } catch (error: any) {
    logger.error("Error closing poll:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
