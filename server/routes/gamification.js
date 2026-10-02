const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

router.get('/leaderboard', auth, leaderboardController.getGlobalLeaderboard);

module.exports = router;
