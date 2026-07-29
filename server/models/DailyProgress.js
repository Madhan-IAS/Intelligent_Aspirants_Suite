const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },           // "2026-07-28" format
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'TimetableSlot', required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

// Unique: one progress entry per user per date per slot
dailyProgressSchema.index({ userId: 1, date: 1, slotId: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
