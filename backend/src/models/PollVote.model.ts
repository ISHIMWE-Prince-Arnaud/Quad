import mongoose, { Schema, Document } from "mongoose";

/**
 * PollVote Document Interface
 * Records user votes on polls
 * Note: Voter information is private and never exposed via API
 */
export interface IPollVoteDocument extends Document {
  pollId: mongoose.Types.ObjectId;
  userId: string;               // Clerk user ID
  optionIndices: number[];      // Selected option indices
  votedAt: Date;
}

const PollVoteSchema = new Schema<IPollVoteDocument>(
  {
    pollId: { 
      type: Schema.Types.ObjectId, 
      ref: "Poll", 
      required: true 
    },
    userId: { 
      type: String, 
      required: true 
    },
    optionIndices: {
      type: [Number],
      required: true,
      validate: {
        validator: function(arr: number[]) {
          return arr.length > 0 && arr.length <= 5;
        },
        message: "Must select at least 1 option and at most 5 options"
      }
    },
    votedAt: { 
      type: Date, 
      default: Date.now 
    },
  },
  { 
    timestamps: false  // We only care about votedAt
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Compound unique index: One vote per user per poll
// This enforces that users can only vote once
PollVoteSchema.index({ pollId: 1, userId: 1 }, { unique: true });

// Index for getting all votes of a poll
PollVoteSchema.index({ pollId: 1, votedAt: -1 });

// Index for getting user's voting history
PollVoteSchema.index({ userId: 1, votedAt: -1 });

export const PollVote = mongoose.model<IPollVoteDocument>("PollVote", PollVoteSchema);
