import Poll from "../models/Poll.js";
import { getIO } from "../config/socket.js";

// @desc    Get all polls
// @route   GET /api/polls
// @access  Public
export const getPolls = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};

    if (type === "would-you-rather") {
      query.isWouldYouRather = true;
    }

    const polls = await Poll.find(query)
      .populate("createdBy", "username avatar")
      .sort({ createdAt: -1 });

    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new poll
// @route   POST /api/polls
// @access  Private
export const createPoll = async (req, res) => {
  try {
    const { question, options, isWouldYouRather } = req.body;

    if (!question || !options || options.length < 2) {
      return res
        .status(400)
        .json({ message: "Question and at least 2 options are required" });
    }

    if (isWouldYouRather && options.length !== 2) {
      return res
        .status(400)
        .json({ message: "Would You Rather must have exactly 2 options" });
    }

    const poll = await Poll.create({
      question: question,
      options: options,
      createdBy: req.user._id,
      isWouldYouRather: isWouldYouRather || false,
    });

    const populatedPoll = await Poll.findById(poll._id).populate(
      "createdBy",
      "username avatar"
    );

    res.status(201).json(populatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Private
export const voteOnPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;

    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Invalid option" });
    }

    // Check if user already voted
    const existingVote = poll.votedBy.find(
      (v) => v.userId.toString() === req.user._id.toString()
    );

    if (existingVote) {
      // Remove previous vote
      poll.options[existingVote.optionIndex].votes -= 1;

      if (existingVote.optionIndex === optionIndex) {
        // Remove vote entirely
        poll.votedBy = poll.votedBy.filter(
          (v) => v.userId.toString() !== req.user._id.toString()
        );
      } else {
        // Change vote
        existingVote.optionIndex = optionIndex;
        poll.options[optionIndex].votes += 1;
      }
    } else {
      // Add new vote
      poll.options[optionIndex].votes += 1;
      poll.votedBy.push({ userId: req.user._id, optionIndex });
    }

    await poll.save();

    const populatedPoll = await Poll.findById(poll._id).populate(
      "createdBy",
      "username avatar"
    );

    // Emit vote update event
    getIO().emit(`poll:${poll._id}:update`, populatedPoll);

    res.json(populatedPoll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single poll
// @route   GET /api/polls/:id
// @access  Public
export const getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate(
      "createdBy",
      "username avatar"
    );

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
