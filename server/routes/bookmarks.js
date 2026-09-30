const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bookmark = require('../models/Bookmark');

router.use(auth);

// GET /api/bookmarks — get all bookmarks for authenticated user
router.get('/', async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.user.id })
            .populate('topicId', 'title paper subjectName chapter completed')
            .sort({ createdAt: -1 });
        res.json(bookmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/bookmarks/toggle/:topicId — toggle bookmark for a topic
router.post('/toggle/:topicId', async (req, res) => {
    try {
        const existing = await Bookmark.findOne({ userId: req.user.id, topicId: req.params.topicId });
        if (existing) {
            await Bookmark.findByIdAndDelete(existing._id);
            res.json({ bookmarked: false });
        } else {
            await Bookmark.create({ userId: req.user.id, topicId: req.params.topicId });
            res.json({ bookmarked: true });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/bookmarks/check/:topicId — check if a topic is bookmarked
router.get('/check/:topicId', async (req, res) => {
    try {
        const existing = await Bookmark.findOne({ userId: req.user.id, topicId: req.params.topicId });
        res.json({ bookmarked: !!existing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
