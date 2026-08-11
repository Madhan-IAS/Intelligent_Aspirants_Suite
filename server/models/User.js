const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, default: 'UPSC CSE Aspirant' },
  targetAttempt: { type: Number },
  optionalSubject: { type: String },
  dailyTargetHours: { type: Number },
  preferredRevisionPattern: { type: String, enum: ['3-5-7', '1-7-30'], default: '3-5-7' },
  examStage: { type: String, enum: ['Foundation', 'Prelims', 'Mains', 'Interview'], default: 'Foundation' },
  theme: { type: String, enum: ['Dark', 'Light'], default: 'Dark' },
  studyPreferences: {
    preferredSession: { type: String, enum: ['Morning', 'Afternoon', 'Night'], default: 'Morning' },
    answerWriting: { type: String, enum: ['Daily', 'Weekly'], default: 'Daily' },
    mockTest: { type: String, enum: ['Sunday', 'Weekly', 'Monthly'], default: 'Sunday' }
  },
  streak: { type: Number, default: 0 },
  reputation: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
