const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['current_affairs', 'revision_due', 'system', 'achievement'],
    default: 'system' 
  },
  title: { type: String, required: true },
  message: { type: String },
  metadata: {
    source: { type: String },        // e.g. "The Hindu", "PIB Delhi"
    articleCount: { type: Number },   // number of articles added
    tags: [{ type: String }]          // UPSC GS tags
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-expire notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
