const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');

router.get('/recent', topicController.getRecentTopics);
router.get('/subject/:subjectId', topicController.getTopicsBySubject);
router.get('/:id', topicController.getTopicById);
router.post('/', topicController.createTopic);
router.patch('/:id/toggle', topicController.toggleTopicCheckbox);
router.patch('/:id/status', topicController.updateTopicStatus);
router.put('/:id', topicController.updateTopic);

module.exports = router;
