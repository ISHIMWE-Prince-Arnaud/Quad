import mongoose, { Schema, Document } from "mongoose";

export interface ISearchHistoryDocument extends Document {
  userId: string; // Clerk user ID
  query: string;
  searchType: 'users' | 'posts' | 'polls' | 'stories' | 'global';
  resultsCount: number;
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    author?: string;
    sortBy?: string;
  };
  createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistoryDocument>(
  {
    userId: { 
      type: String, 
      required: true 
    },
    query: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 200
    },
    searchType: { 
      type: String, 
      enum: ['users', 'posts', 'polls', 'stories', 'global'],
      required: true 
    },
    resultsCount: { 
      type: Number, 
      default: 0,
      min: 0
    },
    filters: {
      dateFrom: { type: Date },
      dateTo: { type: Date },
      author: { type: String },
      sortBy: { type: String }
    }
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Index for user's search history (most recent first)
SearchHistorySchema.index({ userId: 1, createdAt: -1 });

// Index for popular searches analytics
SearchHistorySchema.index({ query: 1, searchType: 1 });

// TTL index - auto-delete search history after 90 days
SearchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const SearchHistory = mongoose.model<ISearchHistoryDocument>("SearchHistory", SearchHistorySchema);
