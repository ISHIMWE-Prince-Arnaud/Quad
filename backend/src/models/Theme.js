import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Theme title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  emoji: {
    type: String,
    default: '🎨',
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validate that endDate is after startDate
themeSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

const Theme = mongoose.model('Theme', themeSchema);

export default Theme;
