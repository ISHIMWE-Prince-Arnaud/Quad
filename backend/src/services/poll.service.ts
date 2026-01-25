import { Poll } from "../models/Poll.model.js";
import { PollVote } from "../models/PollVote.model.js";
import type { IPollVoteDocument } from "../models/PollVote.model.js";
import { User } from "../models/User.model.js";
import type { IMedia } from "../types/post.types.js";
import type { SortOrder } from "mongoose";
import type {
  CreatePollSchemaType,
  GetPollsQuerySchemaType,
  UpdatePollSchemaType,
} from "../schemas/poll.schema.js";
import { getSocketIO } from "../config/socket.config.js";
import {
  emitContentDeleted,
  emitEngagementUpdate,
  emitNewContent,
} from "../sockets/feed.socket.js";
import {
  canViewResults,
  canVoteOnPoll,
  formatPollResponse,
  validateVoteIndices,
} from "../utils/poll.util.js";
import { createNotification } from "../utils/notification.util.js";
import { AppError } from "../utils/appError.util.js";

export class PollService {
  static async createPoll(userId: string, pollData: CreatePollSchemaType) {
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const options = pollData.options.map((opt) => ({
      text: opt.text,
      ...(opt.media !== undefined ? { media: opt.media } : {}),
      votesCount: 0,
    }));

    const poll = await Poll.create({
      author: {
        clerkId: user.clerkId,
        username: user.username,
        email: user.email,
        ...(user.displayName !== undefined ? { displayName: user.displayName } : {}),
        ...(user.firstName !== undefined ? { firstName: user.firstName } : {}),
        ...(user.lastName !== undefined ? { lastName: user.lastName } : {}),
        ...(user.profileImage !== undefined
          ? { profileImage: user.profileImage }
          : {}),
        ...(user.bio !== undefined ? { bio: user.bio } : {}),
      },
      question: pollData.question,
      ...(pollData.questionMedia !== undefined
        ? { questionMedia: pollData.questionMedia }
        : {}),
      options,
      settings: pollData.settings || {
        allowMultiple: false,
        anonymousVoting: false,
        showResults: "afterVote",
      },
      status: "active",
      ...(pollData.expiresAt !== undefined ? { expiresAt: pollData.expiresAt } : {}),
      totalVotes: 0,
      reactionsCount: 0,
      commentsCount: 0,
    });

    const io = getSocketIO();
    io.emit("newPoll", poll);
    emitNewContent(io, "poll", String(poll._id), poll.author.clerkId);

    return poll;
  }

  static async getAllPolls(userId: string | undefined, query: GetPollsQuerySchemaType) {
    const { page, limit, status, author, voted, sort } = query;

    const filter: Record<string, unknown> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (author) {
      filter["author.clerkId"] = author;
    }

    if (voted !== undefined && userId) {
      const userVotes = await PollVote.find({ userId }).select("pollId");
      const votedPollIds = userVotes.map((v) => v.pollId);

      filter._id = voted === true ? { $in: votedPollIds } : { $nin: votedPollIds };
    }

    let sortOption: Record<string, SortOrder> = {};
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

    const skip = (page - 1) * limit;

    const [polls, total] = await Promise.all([
      Poll.find(filter).sort(sortOption).skip(skip).limit(limit),
      Poll.countDocuments(filter),
    ]);

    let userVotes: Partial<Record<string, IPollVoteDocument>> = {};
    if (userId) {
      const votes = await PollVote.find({
        userId,
        pollId: { $in: polls.map((p) => p._id) },
      });
      userVotes = votes.reduce<Partial<Record<string, IPollVoteDocument>>>((acc, v) => {
        acc[v.pollId.toString()] = v;
        return acc;
      }, {});
    }

    const formattedPolls = polls.map((poll) => {
      const pollId = poll._id ? poll._id.toString() : "";
      const userVote = userVotes[pollId];
      const hasVoted = !!userVote;
      const showResults = canViewResults(poll, hasVoted);
      return formatPollResponse(poll, userVote, showResults);
    });

    return {
      polls: formattedPolls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
    };
  }

  static async getMyPolls(userId: string, pageNum: number, limitNum: number) {
    const skip = (pageNum - 1) * limitNum;

    const [polls, total] = await Promise.all([
      Poll.find({ "author.clerkId": userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Poll.countDocuments({ "author.clerkId": userId }),
    ]);

    const formattedPolls = polls.map((poll) => formatPollResponse(poll, undefined, true));

    return {
      polls: formattedPolls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum < Math.ceil(total / limitNum),
      },
    };
  }

  static async getPoll(id: string, userId?: string) {
    const poll = await Poll.findById(id);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    let userVote: unknown = undefined;
    let hasVoted = false;

    if (userId) {
      const vote = await PollVote.findOne({ pollId: id, userId });
      if (vote) {
        userVote = vote;
        hasVoted = true;
      }
    }

    const showResults = canViewResults(poll, hasVoted);
    const formattedPoll = formatPollResponse(poll, userVote as never, showResults);

    return formattedPoll;
  }

  static async updatePoll(userId: string, id: string, updates: UpdatePollSchemaType) {
    const poll = await Poll.findById(id);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (poll.author.clerkId !== userId) {
      throw new AppError("Only the author can update this poll", 403);
    }

    if (poll.status === "closed") {
      throw new AppError("Cannot update a closed poll", 400);
    }

    if (updates.question) {
      poll.question = updates.question;
    }

    if (updates.questionMedia !== undefined) {
      const { url, type, aspectRatio } = updates.questionMedia;

      const questionMedia: IMedia = {
        url,
        type,
        ...(aspectRatio !== undefined ? { aspectRatio } : {}),
      };

      poll.questionMedia = questionMedia;
    }

    await poll.save();

    getSocketIO().emit("pollUpdated", poll);

    return poll;
  }

  static async deletePoll(userId: string, id: string) {
    const poll = await Poll.findById(id);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (poll.author.clerkId !== userId) {
      throw new AppError("Only the author can delete this poll", 403);
    }

    await Promise.all([Poll.findByIdAndDelete(id), PollVote.deleteMany({ pollId: id })]);

    const io = getSocketIO();
    io.emit("pollDeleted", id);
    emitContentDeleted(io, "poll", id);
  }

  static async voteOnPoll(userId: string, id: string, optionIndices: number[]) {
    const poll = await Poll.findById(id);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (!canVoteOnPoll(poll)) {
      throw new AppError("This poll is not accepting votes", 400);
    }

    const validation = validateVoteIndices(poll, optionIndices);
    if (!validation.valid) {
      throw new AppError(validation.error || "Invalid vote", 400);
    }

    const existingVote = await PollVote.findOne({ pollId: id, userId });
    if (existingVote) {
      throw new AppError("You have already voted on this poll", 400);
    }

    const vote = await PollVote.create({
      pollId: id,
      userId,
      optionIndices,
      votedAt: new Date(),
    });

    const previousTotalVotes = poll.totalVotes;

    optionIndices.forEach((index) => {
      if (poll.options[index]) {
        poll.options[index].votesCount += 1;
      }
    });

    poll.totalVotes += 1;
    const newTotalVotes = poll.totalVotes;
    await poll.save();

    const milestones = [10, 50, 100, 250, 500, 1000, 5000, 10000];
    const reachedMilestone = milestones.find(
      (milestone) => previousTotalVotes < milestone && newTotalVotes >= milestone
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

    const formattedPoll = formatPollResponse(poll, vote, true);

    return { vote, formattedPoll };
  }

  static async removeVote(userId: string, id: string) {
    const poll = await Poll.findById(id);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (poll.author.clerkId !== userId) {
      throw new AppError("Only the poll author can remove votes", 403);
    }

    const vote = await PollVote.findOne({ pollId: id, userId });
    if (!vote) {
      throw new AppError("No vote found", 404);
    }

    vote.optionIndices.forEach((index) => {
      if (poll.options[index]) {
        poll.options[index].votesCount -= 1;
      }
    });

    poll.totalVotes -= 1;

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
  }

  static async closePoll(userId: string, id: string) {
    const poll = await Poll.findById(id);
    if (!poll) {
      throw new AppError("Poll not found", 404);
    }

    if (poll.author.clerkId !== userId) {
      throw new AppError("Only the author can close this poll", 403);
    }

    if (poll.status !== "active") {
      throw new AppError(`Poll is already ${poll.status}`, 400);
    }

    poll.status = "closed";
    await poll.save();

    getSocketIO().emit("pollClosed", id);

    return poll;
  }
}
