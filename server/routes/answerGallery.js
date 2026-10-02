const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');

// Public gallery — no auth required so all aspirants can view top answers
router.get('/', answerController.getTopAnswersGlobal);

module.exports = router;
