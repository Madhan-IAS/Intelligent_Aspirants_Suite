const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
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
  durationMinutes: {
    type: Number,
    required: true,
    default: 50 // Standard Pomodoro
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
