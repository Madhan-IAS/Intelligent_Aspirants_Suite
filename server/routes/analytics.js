const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Answer = require('../models/Answer');
const FocusSession = require('../models/FocusSession');

router.get('/ping', (req, res) => res.json({ msg: 'pong' }));

router.use(auth);

// Heatmap Data (aggregating tasks, answers, and focus sessions)
router.get('/heatmap', async (req, res) => {
  try {
    // Generate an array of the last 365 days with counts
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const [tasks, answers, sessions] = await Promise.all([
      Task.find({ user: req.user.id, completed: true, updatedAt: { $gte: oneYearAgo } }),
      Answer.find({ createdAt: { $gte: oneYearAgo } }),
      FocusSession.find({ userId: req.user.id, date: { $gte: oneYearAgo } })
    ]);

    const activityMap = {};

    const addActivity = (dateObj, weight) => {
      if (!dateObj) return;
      const dateStr = dateObj.toISOString().split('T')[0];
      if (!activityMap[dateStr]) activityMap[dateStr] = 0;
      activityMap[dateStr] += weight;
    };

    tasks.forEach(t => addActivity(t.updatedAt, 1));
    answers.forEach(a => addActivity(a.createdAt, 3));
    sessions.forEach(s => addActivity(s.date, 2));

    const heatmapData = Object.keys(activityMap).map(date => ({
      date,
      count: activityMap[date]
    }));

    res.json(heatmapData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
