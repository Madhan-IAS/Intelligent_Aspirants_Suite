const EssayTheme = require('../models/EssayTheme');
const Answer = require('../models/Answer');

// GET /api/essays — list all essay themes
exports.getEssayThemes = async (req, res) => {
    try {
        const { category, dimension } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (dimension) filter.spectrumDimensions = dimension;

        const themes = await EssayTheme.find(filter)
            .populate('relatedTopicIds', 'title paper')
            .sort({ createdAt: -1 });
        res.json(themes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/essays — create an essay theme
exports.createEssayTheme = async (req, res) => {
    try {
        const theme = new EssayTheme(req.body);
        await theme.save();
        res.status(201).json(theme);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// GET /api/essays/:id — single theme with related topics
exports.getEssayTheme = async (req, res) => {
    try {
        const theme = await EssayTheme.findById(req.params.id)
            .populate('relatedTopicIds', 'title paper subjectName chapter');
        if (!theme) return res.status(404).json({ message: 'Theme not found' });
        res.json(theme);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/answers/gallery/:topicId — sample/model answers for a topic
exports.getAnswerGallery = async (req, res) => {
    try {
        const answers = await Answer.find({
            status: 'Evaluated',
        })
            .populate('pyqId', 'question year marks directive')
            .sort({ score: -1 })
            .limit(10);
        res.json(answers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
