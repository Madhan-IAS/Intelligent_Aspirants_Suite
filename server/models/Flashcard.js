const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['GS I', 'GS II', 'GS III', 'GS IV', 'Sociology', 'Current Affairs', 'Other']
  },
  topic: {
    type: String
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  front: {
    type: String, // Question
    required: true
  },
  back: {
    type: String, // Answer
    required: true
  },
  interval: {
    type: Number,
    default: 1 // Next review interval in days
  },
  easeFactor: {
    type: Number,
    default: 2.5 // SuperMemo-2 ease factor
  },
  repetitions: {
    type: Number,
    default: 0
  },
  nextReviewDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
