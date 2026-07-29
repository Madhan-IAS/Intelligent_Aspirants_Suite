const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/daily', quizController.getDailyQuiz);
router.post('/generate', quizController.generateDailyQuiz);
router.put('/:id/submit', quizController.submitQuiz);

module.exports = router;
