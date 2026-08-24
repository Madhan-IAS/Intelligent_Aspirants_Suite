const MindMap = require('../models/MindMap');

// GET /api/mind-maps?paper=GS I&subject=Ancient India
exports.getAllMindMaps = async (req, res) => {
    try {
        const filter = {};
        if (req.query.paper) filter.paper = req.query.paper;
        if (req.query.subject) filter.subject = req.query.subject;

        const mindMaps = await MindMap.find(filter).sort({ paper: 1, subject: 1, sortOrder: 1, createdAt: -1 });
        res.json(mindMaps);
    } catch (error) {
        console.error('Error fetching mind maps:', error);
        res.status(500).json({ error: 'Failed to fetch mind maps' });
    }
};

// GET /api/mind-maps/subjects - Get distinct subjects grouped by paper
exports.getSubjectsByPaper = async (req, res) => {
    try {
        const result = await MindMap.aggregate([
            { $group: { _id: { paper: '$paper', subject: '$subject' }, count: { $sum: 1 } } },
            { $sort: { '_id.paper': 1, '_id.subject': 1 } }
        ]);

        const grouped = {};
        result.forEach(r => {
            if (!grouped[r._id.paper]) grouped[r._id.paper] = [];
            grouped[r._id.paper].push({ subject: r._id.subject, count: r.count });
        });

        res.json(grouped);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};

// GET /api/mind-maps/:id
exports.getMindMapById = async (req, res) => {
    try {
        const mindMap = await MindMap.findById(req.params.id);
        if (!mindMap) return res.status(404).json({ error: 'Mind map not found' });
        res.json(mindMap);
    } catch (error) {
        console.error('Error fetching mind map:', error);
        res.status(500).json({ error: 'Failed to fetch mind map' });
    }
};

// POST /api/mind-maps
exports.createMindMap = async (req, res) => {
    try {
        const mindMap = await MindMap.create(req.body);
        res.status(201).json(mindMap);
    } catch (error) {
        console.error('Error creating mind map:', error);
        res.status(400).json({ error: error.message });
    }
};

// PUT /api/mind-maps/:id
exports.updateMindMap = async (req, res) => {
    try {
        const mindMap = await MindMap.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!mindMap) return res.status(404).json({ error: 'Mind map not found' });
        res.json(mindMap);
    } catch (error) {
        console.error('Error updating mind map:', error);
        res.status(400).json({ error: error.message });
    }
};

// DELETE /api/mind-maps/:id
exports.deleteMindMap = async (req, res) => {
    try {
        const mindMap = await MindMap.findByIdAndDelete(req.params.id);
        if (!mindMap) return res.status(404).json({ error: 'Mind map not found' });
        res.json({ message: 'Mind map deleted successfully' });
    } catch (error) {
        console.error('Error deleting mind map:', error);
        res.status(500).json({ error: 'Failed to delete mind map' });
    }
};
