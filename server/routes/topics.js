const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
router.get('/recent', auth, topicController.getRecentTopics);
router.get('/subject/:subjectId', auth, topicController.getTopicsBySubject);
router.get('/:id', auth, topicController.getTopicById);
router.post('/', auth, requireAdmin, topicController.createTopic);
router.patch('/:id/toggle', auth, topicController.toggleTopicCheckbox); // User action (checking off topics)
router.patch('/:id/status', auth, topicController.updateTopicStatus); // User action (updating completion state)
router.put('/:id', auth, requireAdmin, topicController.updateTopic);

module.exports = router;
