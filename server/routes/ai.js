const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { checkTrialLimit } = require('../middleware/aiLimits');
const auth = require('../middleware/auth');

router.post('/evaluate', auth, checkTrialLimit('aiAnswerEvaluations', 2), aiController.evaluateAnswer);
router.get('/daily-quiz', auth, checkTrialLimit('aiQuizGenerated', 1), aiController.generateDailyQuiz);
router.get('/daily-question', auth, checkTrialLimit('aiQuestionGenerated', 1), aiController.generateDailyQuestion);
router.post('/generate-outline', auth, checkTrialLimit('aiTopicSummaries', 3), aiController.generateModelOutline);
router.post('/generate-topic-notes', auth, checkTrialLimit('aiTopicSummaries', 3), aiController.generateTopicNotes);
router.post('/generate-analysis-prompts', auth, checkTrialLimit('aiAnalyticPrompts', 2), aiController.generateAnalysisPrompts);
router.post('/auto-link-current-affairs', auth, aiController.autoLinkCurrentAffairs); // Admin only, needs different guard if user
router.post('/evaluate-essay', auth, checkTrialLimit('aiEssayEvaluations', 1), aiController.evaluateEssay);
router.post('/recommend-next', auth, checkTrialLimit('aiRecommendations', 3), aiController.recommendNextTopics);

module.exports = router;
