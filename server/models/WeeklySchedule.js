const mongoose = require('mongoose');

const weeklyScheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },          // "Monday", "Saturday", etc.
  task: { type: String, required: true },
  duration: { type: String, required: true },
  isSpecial: { type: Boolean, default: false },    // true for Saturday/Sunday specials
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('WeeklySchedule', weeklyScheduleSchema);
