const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const FocusSession = require('../models/FocusSession');

router.use(auth);

// Log a new focus session
router.post('/', async (req, res) => {
  try {
    const { subject, durationMinutes } = req.body;
    const session = new FocusSession({
      userId: req.user.id,
      subject,
      durationMinutes
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

module.exports = router;
