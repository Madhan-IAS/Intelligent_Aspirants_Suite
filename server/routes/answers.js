const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', answerController.getAnswers);
router.get('/pyq/:pyqId', answerController.getAnswersForPYQ);
router.post('/', answerController.saveAnswer);

module.exports = router;
