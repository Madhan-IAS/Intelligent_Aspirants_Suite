const Interlinkage = require('../models/Interlinkage');

// GET /api/interlinkages/:topicId — all cross-dimensional links for a topic
exports.getInterlinkages = async (req, res) => {
    try {
        const links = await Interlinkage.find({
            $or: [
                { sourceTopicId: req.params.topicId },
                { targetTopicId: req.params.topicId }
            ]
        })
            .populate('sourceTopicId', 'title paper subjectName chapter topicCode')
            .populate('targetTopicId', 'title paper subjectName chapter topicCode')
            .sort({ strength: 1 });

        // Normalize: always return the "other" topic as the linked one
        const normalized = links.map(link => {
            const isSource = link.sourceTopicId._id.toString() === req.params.topicId;
            return {
                _id: link._id,
                dimension: link.dimension,
                strength: link.strength,
                note: link.note,
                linkedTopic: isSource ? link.targetTopicId : link.sourceTopicId
            };
        });

        res.json(normalized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/interlinkages — create a new interlinkage
exports.createInterlinkage = async (req, res) => {
    try {
        const { sourceTopicId, targetTopicId, dimension, strength, note } = req.body;
        const link = new Interlinkage({ sourceTopicId, targetTopicId, dimension, strength, note });
        await link.save();
        res.status(201).json(link);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'This interlinkage already exists.' });
        }
        res.status(400).json({ message: error.message });
    }
};

// DELETE /api/interlinkages/:id — remove an interlinkage
exports.deleteInterlinkage = async (req, res) => {
    try {
        await Interlinkage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Interlinkage removed.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
