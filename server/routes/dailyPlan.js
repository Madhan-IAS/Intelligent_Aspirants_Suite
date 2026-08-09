const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dailyPlanController = require('../controllers/dailyPlanController');

router.use(auth);

router.get('/today', dailyPlanController.getTodayPlan);
router.patch('/toggle-topic/:topicId', dailyPlanController.toggleTopic);
router.get('/stats', dailyPlanController.getStats);

module.exports = router;
