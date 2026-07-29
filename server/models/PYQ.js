const mongoose = require('mongoose');

const pyqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  year: { type: Number, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  directive: { type: String }, // e.g., Discuss, Analyze, Critically Examine
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  marks: { type: Number, default: 10 },
  wordLimit: { type: Number, default: 150 }
}, { timestamps: true });

pyqSchema.index({ 
  question: 'text', 
  directive: 'text' 
});

module.exports = mongoose.model('PYQ', pyqSchema);
