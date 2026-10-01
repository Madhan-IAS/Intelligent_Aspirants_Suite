const mongoose = require('mongoose');

const revisionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  interval: { type: Number, enum: [1, 3, 7, 15, 30, 90], required: true },
  scheduledDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Missed'], default: 'Pending' },
  completedDate: { type: Date }
}, { timestamps: true });

revisionSchema.index({ userId: 1, scheduledDate: 1, status: 1 });

module.exports = mongoose.model('Revision', revisionSchema);
