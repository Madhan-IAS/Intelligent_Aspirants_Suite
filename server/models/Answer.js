const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pyqId: { type: mongoose.Schema.Types.ObjectId, ref: 'PYQ', required: true },
  content: { type: String, required: true },
  aiEvaluation: {
    score: { type: Number },
    feedback: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    suggestedPoints: [{ type: String }]
  },
  timeTaken: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Submitted', 'Evaluated'], default: 'Draft' },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
