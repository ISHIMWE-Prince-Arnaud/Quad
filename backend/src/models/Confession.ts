import mongoose, { Schema, Document } from 'mongoose';

export interface IThought {
  anonymousAuthorId: string;
  content: string;
  createdAt: Date;
}

export interface IConfession extends Document {
  anonymousAuthorId: string;
  anonymousUsername: string;
  anonymousAvatar: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[];
  thoughts: IThought[];
  createdAt: Date;
}

const ThoughtSchema: Schema = new Schema({
  anonymousAuthorId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const ConfessionSchema: Schema = new Schema({
  anonymousAuthorId: {
    type: String,
    required: true,
  },
  anonymousUsername: {
    type: String,
    required: true,
  },
  anonymousAvatar: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  mediaUrl: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
  },
  likes: [{
    type: String, // Array of anonymousAuthorIds
  }],
  thoughts: [ThoughtSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
ConfessionSchema.index({ createdAt: -1 });

export default mongoose.model<IConfession>('Confession', ConfessionSchema);
