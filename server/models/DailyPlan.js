const mongoose = require('mongoose');

const dailyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },                    // "2026-08-09" IST date
  gsPaper: { type: String, required: true },                 // "GS I", "GS II", etc.
  optionalPaper: { type: String, default: 'Sociology Paper I' }, // "Sociology Paper I" or "Paper II"
  gsTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],   // 4 GS topics
  optTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],  // 3 Sociology topics
  revisionTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }, // 1 revision topic
  rotationDay: { type: Number, default: 0 },                 // 0-7 rotation index
  completed: { type: Boolean, default: false }                // All topics done?
}, { timestamps: true });

// One plan per user per day
dailyPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyPlan', dailyPlanSchema);
