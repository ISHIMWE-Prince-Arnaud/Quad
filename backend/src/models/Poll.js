import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 200,
  },
  votes: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please provide a question'],
    maxlength: [300, 'Question cannot exceed 300 characters'],
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(v) {
        return v.length >= 2 && v.length <= 6;
      },
      message: 'Poll must have between 2 and 6 options',
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  votedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    optionIndex: {
      type: Number,
    },
  }],
  isWouldYouRather: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;
