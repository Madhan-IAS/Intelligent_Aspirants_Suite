const mongoose = require('mongoose');

const userTopicProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
}, { timestamps: true });

// A user can only have one progress record per topic
userTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('UserTopicProgress', userTopicProgressSchema);
