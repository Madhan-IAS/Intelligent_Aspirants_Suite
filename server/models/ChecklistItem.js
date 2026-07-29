const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true },
  icon: { type: String, default: '✅' },
  category: { type: String, enum: ['daily_target', 'end_of_day'], required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ChecklistItem', checklistItemSchema);
