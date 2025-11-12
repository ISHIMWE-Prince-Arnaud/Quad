import mongoose, { Schema, Document } from "mongoose";

export interface ISearchAnalyticsDocument extends Document {
  query: string;
  searchType: 'users' | 'posts' | 'polls' | 'stories' | 'global';
  searchCount: number;
  lastSearched: Date;
  avgResultsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SearchAnalyticsSchema = new Schema<ISearchAnalyticsDocument>(
  {
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
    searchCount: { 
      type: Number, 
      default: 1,
      min: 1
    },
    lastSearched: { 
      type: Date, 
      default: Date.now 
    },
    avgResultsCount: { 
      type: Number, 
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
  }
);

// ===========================
// INDEXES FOR PERFORMANCE
// ===========================

// Unique index for query + searchType combination
SearchAnalyticsSchema.index({ query: 1, searchType: 1 }, { unique: true });

// Index for popular searches (most searched first)
SearchAnalyticsSchema.index({ searchCount: -1, lastSearched: -1 });

// Index for recent searches
SearchAnalyticsSchema.index({ lastSearched: -1 });

export const SearchAnalytics = mongoose.model<ISearchAnalyticsDocument>("SearchAnalytics", SearchAnalyticsSchema);
