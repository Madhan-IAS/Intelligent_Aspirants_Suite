const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    paper: {
        type: String,
        required: true,
        enum: ['GS I', 'GS II', 'GS III', 'GS IV', 'CSAT']
    },
    subject: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    tags: [{ type: String }],
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Published'
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

noteSchema.index({ paper: 1, subject: 1 });
noteSchema.index({ title: 'text', subject: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);
