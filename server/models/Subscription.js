const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    utrNumber: { type: String, required: true },
    screenshot: { type: String }, // Base64 encoded image
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
