const mongoose = require('mongoose');

const essayThemeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: {
        type: String,
        enum: ['Philosophical', 'Social', 'Political', 'Economic', 'Science & Tech', 'Environment', 'Ethics', 'Abstract'],
        required: true
    },
    spectrumDimensions: [{ type: String }],  // e.g. ['Society', 'Economy', 'Ethics & Integrity']
    description: { type: String, default: '' },
    sampleAngles: [{ type: String }],        // Perspective angles to explore
    relatedTopicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    year: { type: Number },                  // UPSC year if PYQ essay
    wordLimit: { type: Number, default: 1200 },
}, { timestamps: true });

essayThemeSchema.index({ title: 'text', category: 'text' });

module.exports = mongoose.model('EssayTheme', essayThemeSchema);
