const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  passwordHash: { type: String, required: true },
  refreshToken: { type: String },
  resetOtp: { type: String },
  otpExpiry: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptionStatus: { type: String, enum: ['pending', 'pending_review', 'active', 'expired', 'rejected'], default: 'pending' },
  subscriptionTier: { type: String, enum: ['foundation', 'aspirant', 'topper'], default: 'foundation' },
  subscriptionExpiry: { type: Date },
  isTrial: { type: Boolean, default: false },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bio: { type: String, default: 'UPSC CSE Aspirant' },
  targetAttempt: { type: Number },
  attemptNumber: { type: Number, min: 1, max: 6, default: 1 },
  optionalSubject: { type: String },
  dailyTargetHours: { type: Number },
  preferredRevisionPattern: { type: String, enum: ['3-5-7', '1-7-30'], default: '3-5-7' },
  examStage: { type: String, enum: ['Beginner', 'First Reading', 'Revision', 'Test Phase', 'Interview'], default: 'Beginner' },
  onboardingComplete: { type: Boolean, default: false },
  theme: { type: String, enum: ['Dark', 'Light'], default: 'Dark' },
  studyPreferences: {
    preferredSession: { type: String, enum: ['Morning', 'Afternoon', 'Night'], default: 'Morning' },
    answerWriting: { type: String, enum: ['Daily', 'Weekly'], default: 'Daily' },
    mockTest: { type: String, enum: ['Sunday', 'Weekly', 'Monthly'], default: 'Sunday' }
  },
  streak: { type: Number, default: 0 },
  reputation: { type: Number, default: 0 },
  usageStats: {
    aiQuizGenerated: { type: Number, default: 0 },
    aiQuestionGenerated: { type: Number, default: 0 },
    aiAnswerEvaluations: { type: Number, default: 0 },
    aiEssayEvaluations: { type: Number, default: 0 },
    aiTopicSummaries: { type: Number, default: 0 },
    aiRecommendations: { type: Number, default: 0 },
    aiAnalyticPrompts: { type: Number, default: 0 },
    customFlashcards: { type: Number, default: 0 },
    customNotes: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
