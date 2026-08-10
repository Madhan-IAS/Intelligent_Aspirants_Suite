const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/evaluate', aiController.evaluateAnswer);
router.get('/daily-quiz', aiController.generateDailyQuiz);
router.get('/daily-question', aiController.generateDailyQuestion);
router.post('/generate-outline', aiController.generateModelOutline);
router.post('/generate-topic-notes', aiController.generateTopicNotes);
router.post('/generate-analysis-prompts', aiController.generateAnalysisPrompts);

module.exports = router;
