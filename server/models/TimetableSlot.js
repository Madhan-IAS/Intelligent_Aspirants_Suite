const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  time: { type: String, required: true },          // e.g. "05:00 – 05:20 AM"
  duration: { type: String, required: true },       // e.g. "20 min"
  session: { type: String, required: true },        // e.g. "Morning Routine"
  activity: { type: String, required: true },       // e.g. "Wake Up, Freshen Up"
  category: { type: String, enum: [
    'Study', 'Revision', 'Answer Writing', 'Current Affairs', 
    'Break', 'Mock Test', 'PYQ Practice', 'KMS Development',
    'Value Addition', 'Daily Review', 'Morning Routine', 'Health & Planning', 'Sleep'
  ], default: 'Study' },
  objective: { type: String },                      // e.g. "Prepare for the day"
  expectedOutput: { type: String },                 // e.g. "Fresh & Ready"
  order: { type: Number, required: true },          // Display order
  isStudyBlock: { type: Boolean, default: false }   // Whether this is a core study block (for stats)
}, { timestamps: true });

module.exports = mongoose.model('TimetableSlot', timetableSlotSchema);
