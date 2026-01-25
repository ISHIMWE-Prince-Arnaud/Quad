import mongoose, { Schema, Document } from "mongoose";
import type { IUser } from "../types/user.types.js";
import type { PollStatus, ResultsVisibility } from "../types/poll.types.js";
import type { IMedia } from "../types/post.types.js";

/**
 * Poll Document Interface
 * Extends IPoll with Mongoose Document properties
 */
export interface IPollDocument extends Document {
  author: IUser;
  question: string;
  questionMedia?: IMedia;
  options: Array<{
    text: string;
    media?: IMedia;
    votesCount: number;
  }>;
  settings: {
    allowMultiple: boolean;
    anonymousVoting: boolean;
    showResults: ResultsVisibility;
  };
  status: PollStatus;
  expiresAt?: Date;
  totalVotes: number;
  reactionsCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPollDocument>(
  {
    // Author (embedded user snapshot)
    author: { 
      type: Object, 
      required: true 
    },
    
    // Question
    question: { 
      type: String, 
      required: true,
      minlength: 10,
      maxlength: 500,
      trim: true
    },
    
    // Question media (optional)
    questionMedia: {
      url: { type: String, required: false },
      type: { 
        type: String, 
        enum: ["image", "video"], 
        required: false 
      },
      aspectRatio: { 
        type: String, 
        enum: ["1:1", "16:9", "9:16"], 
        required: false 
      },
    },
    
    // Options (2-5 options)
    options: {
      type: [
        {
          text: { 
            type: String, 
            required: true,
            minlength: 1,
            maxlength: 200
          },
          media: {
            url: { type: String, required: false },
            type: { 
              type: String, 
              enum: ["image", "video"], 
              required: false 
            },
            aspectRatio: { 
              type: String, 
              enum: ["1:1", "16:9", "9:16"], 
              required: false 
            },
          },
          votesCount: { 
            type: Number, 
            default: 0,
            min: 0
          }
        }
      ],
      required: true,
      validate: {
        validator: function(options: unknown[]) {
          return Array.isArray(options) && options.length >= 2 && options.length <= 5;
        },
        message: "Poll must have between 2 and 5 options"
      }
    },
    
    // Settings
    settings: {
      allowMultiple: { 
        type: Boolean, 
        default: false 
      },
      anonymousVoting: {
        type: Boolean,
        default: false,
      },
      showResults: { 
        type: String, 
        enum: ["always", "afterVote", "afterExpiry"],
        default: "afterVote"
      }
    },
    
    // Status
    status: { 
      type: String, 
      enum: ["active", "expired", "closed"],
      default: "active"
    },
    
    // Expiration (optional)
    expiresAt: { 
      type: Date,
      required: false
    },
    
    // Engagement counts (cached)
    totalVotes: { 
      type: Number, 
      default: 0,
      min: 0
    },
    reactionsCount: { 
      type: Number, 
      default: 0,
      min: 0
    },
    commentsCount: { 
      type: Number, 
      default: 0,
      min: 0
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Index for feed queries (active polls first, then by date)
PollSchema.index({ status: 1, createdAt: -1 });

// Index for author's polls
PollSchema.index({ "author.clerkId": 1, createdAt: -1 });

// Index for expiry checking (used by cron job)
PollSchema.index({ status: 1, expiresAt: 1 });

// Text search on question and options

// Index for trending polls (by total votes)
PollSchema.index({ totalVotes: -1, createdAt: -1 });

// Feed-specific index for trending sort with engagement
PollSchema.index({ status: 1, createdAt: -1, totalVotes: -1, reactionsCount: -1, commentsCount: -1 });

// ===========================
// PRE-SAVE HOOKS
// ===========================

// Validate option text uniqueness
PollSchema.pre("save", function(next) {
  const optionTexts = this.options.map(opt => opt.text.toLowerCase().trim());
  const uniqueTexts = new Set(optionTexts);
  
  if (optionTexts.length !== uniqueTexts.size) {
    return next(new Error("Poll options must have unique text"));
  }
  
  next();
});

export const Poll = mongoose.model<IPollDocument>("Poll", PollSchema);
