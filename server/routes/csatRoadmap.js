const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/csatRoadmapController');

router.use(auth);

router.get('/progress', ctrl.getProgress);
router.patch('/complete/:dayNumber', ctrl.completeDay);
router.delete('/uncomplete/:dayNumber', ctrl.uncompleteDay);
router.post('/skip', ctrl.skipDay);
router.post('/reset', ctrl.resetRoadmap);

module.exports = router;
