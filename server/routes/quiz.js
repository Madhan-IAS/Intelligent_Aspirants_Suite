const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/history', quizController.getQuizHistory);
router.get('/daily', quizController.getDailyQuiz);
router.get('/:id', quizController.getQuizById);
router.post('/generate', quizController.generateDailyQuiz);
router.post('/generate-topic', quizController.generateTopicQuiz);
router.put('/:id/submit', quizController.submitQuiz);

module.exports = router;
