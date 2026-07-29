const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
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
  status: { type: String, enum: ['Draft', 'Submitted', 'Evaluated'], default: 'Draft' }
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
