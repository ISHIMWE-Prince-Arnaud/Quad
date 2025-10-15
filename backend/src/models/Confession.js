import mongoose from 'mongoose';

const confessionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Confession text is required'],
    maxlength: [1000, 'Confession cannot exceed 1000 characters'],
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: String, // Store IP or session ID for anonymous likes
  }],
  reports: {
    type: Number,
    default: 0,
  },
  reportedBy: [{
    type: String, // Store IP or session ID
  }],
  isHidden: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-hide if too many reports
confessionSchema.pre('save', function(next) {
  if (this.reports >= 5) {
    this.isHidden = true;
  }
  next();
});

const Confession = mongoose.model('Confession', confessionSchema);

export default Confession;
