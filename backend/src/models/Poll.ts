import mongoose, { Schema, Document } from 'mongoose';

export interface IPollOption {
  text: string;
  votes: mongoose.Types.ObjectId[];
}

export interface IPoll extends Document {
  author: mongoose.Types.ObjectId;
  question: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  options: IPollOption[];
  isWouldYouRather: boolean;
  createdAt: Date;
}

const PollOptionSchema: Schema = new Schema({
  text: {
    type: String,
    required: true,
  },
  votes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { _id: false });

const PollSchema: Schema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: String,
    required: true,
    maxlength: 300,
  },
  mediaUrl: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
  },
  options: {
    type: [PollOptionSchema],
    required: true,
    validate: {
      validator: function(v: IPollOption[]) {
        return v.length >= 2 && v.length <= 10;
      },
      message: 'Poll must have between 2 and 10 options',
    },
  },
  isWouldYouRather: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
PollSchema.index({ createdAt: -1 });

export default mongoose.model<IPoll>('Poll', PollSchema);
