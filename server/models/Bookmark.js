const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
}, { timestamps: true });

bookmarkSchema.index({ userId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
