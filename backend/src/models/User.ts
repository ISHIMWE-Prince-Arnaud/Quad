import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture: string | null;
  refreshTokens: string[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  profilePicture: {
    type: String,
    default: null,
  },
  refreshTokens: {
    type: [String],
    default: [],
    select: false, // Don't include in queries by default
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Note: username already has an index due to unique: true

export default mongoose.model<IUser>('User', UserSchema);
