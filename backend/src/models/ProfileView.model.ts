import mongoose, { Schema, Document } from "mongoose";

export interface IProfileViewDocument extends Document {
  profileId: string;
  viewerId: string;
  createdAt: Date;
}

const ProfileViewSchema = new Schema<IProfileViewDocument>(
  {
    profileId: { type: String, required: true, index: true },
    viewerId: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ProfileViewSchema.index({ profileId: 1, createdAt: -1 });
ProfileViewSchema.index({ profileId: 1, viewerId: 1, createdAt: -1 });

export const ProfileView = mongoose.model<IProfileViewDocument>(
  "ProfileView",
  ProfileViewSchema
);
