const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FocusSession = require('../models/FocusSession');

router.use(auth);

// Log a new focus session
router.post('/', async (req, res) => {
  try {
    const { subject, durationMinutes, type, startTime, endTime, topicId, subtopicTitle } = req.body;
    const session = new FocusSession({
      userId: req.user.id,
      subject,
      durationMinutes,
      type: type || 'Standard',
      startTime,
      endTime,
      topicId: topicId || undefined,
      subtopicTitle
    });
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get focus stats for the user (last 7 days aggregation)
router.get('/stats', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await FocusSession.aggregate([
      {
        $match: {
          userId: req.user.id,
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: '$subject',
          totalMinutes: { $sum: '$durationMinutes' }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get deep work session history (for NightOwl type sessions)
router.get('/history', async (req, res) => {
  try {
    const sessions = await FocusSession.find({
      userId: req.user.id,
      type: 'NightOwl'
    })
      .populate('topicId', 'title topicCode chapter')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get deep work heatmap / time-of-day analytics
router.get('/heatmap', async (req, res) => {
  try {
    const sessions = await FocusSession.find({ userId: req.user.id });

    const dailyMap = {};
    const hourlyMap = Array(24).fill(0);

    sessions.forEach(session => {
      const dateStr = session.date.toISOString().split('T')[0];
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + session.durationMinutes;

      if (session.startTime) {
        const hour = new Date(session.startTime).getHours();
        hourlyMap[hour] += session.durationMinutes;
      }
    });

    const heatmap = Object.keys(dailyMap).map(date => ({ date, count: dailyMap[date] }));

    res.json({ heatmap, hourlyData: hourlyMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
