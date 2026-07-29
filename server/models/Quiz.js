const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }, // The correct option string
  explanation: { type: String, required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }
});

const quizSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  questions: [questionSchema],
  type: { type: String, enum: ['Daily', 'Subject', 'FullLength'], default: 'Daily' },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  score: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
