const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    utrNumber: { type: String }, // Now optional
    requestedTier: { type: String, enum: ['foundation', 'aspirant', 'topper'] },
    isAnnual: { type: Boolean, default: false },
    screenshot: { type: String }, // Base64 encoded image
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNote: { type: String },
    adminNote: { type: String }, // Hidden internal note
    approvedTier: { type: String, enum: ['foundation', 'aspirant', 'topper'] },
    approvedDuration: { type: Number },          // months granted
    approvedExpiry: { type: Date },              // final expiry date set
    approvedAmount: { type: Number, default: 0 },// ₹ recorded at approval
    paymentMethod: { type: String, enum: ['manual', 'gateway', 'scholarship'], default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
