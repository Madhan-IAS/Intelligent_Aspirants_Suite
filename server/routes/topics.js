const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const auth = require('../middleware/auth');

router.get('/recent', auth, topicController.getRecentTopics);
router.get('/subject/:subjectId', auth, topicController.getTopicsBySubject);
router.get('/:id', auth, topicController.getTopicById);
router.post('/', auth, topicController.createTopic);
router.patch('/:id/toggle', auth, topicController.toggleTopicCheckbox);
router.patch('/:id/status', auth, topicController.updateTopicStatus);
router.put('/:id', auth, topicController.updateTopic);

module.exports = router;
