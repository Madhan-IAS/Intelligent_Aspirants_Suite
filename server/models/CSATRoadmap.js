const mongoose = require('mongoose');

const csatRoadmapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    planStartDate: { type: Date, default: new Date('2026-10-12') },
    targetEndDate: { type: Date, default: new Date('2027-01-31') },
    completedDays: [{
        dayNumber: { type: Number, required: true, min: 1, max: 112 },
        completedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' }
    }],
    skippedDates: [{ type: Date }]
}, { timestamps: true });

csatRoadmapSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('CSATRoadmap', csatRoadmapSchema);
