const mongoose = require('mongoose');

const interlinkageSchema = new mongoose.Schema({
    sourceTopicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    targetTopicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true
    },
    dimension: {
        type: String,
        required: true,
        enum: [
            'Society',
            'Polity & Governance',
            'Economy',
            'Culture & History',
            'Technology & Science',
            'International Relations',
            'Environment & Geography',
            'Ethics & Integrity',
            'Sociology',
            'Current Affairs'
        ]
    },
    strength: {
        type: String,
        enum: ['Strong', 'Moderate', 'Weak'],
        default: 'Moderate'
    },
    note: {
        type: String,
        default: ''
    }
}, { timestamps: true });

// Prevent duplicate links
interlinkageSchema.index({ sourceTopicId: 1, targetTopicId: 1 }, { unique: true });
// Fast lookup by source topic
interlinkageSchema.index({ sourceTopicId: 1 });

module.exports = mongoose.model('Interlinkage', interlinkageSchema);
