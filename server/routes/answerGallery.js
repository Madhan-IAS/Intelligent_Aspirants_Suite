const express = require('express');
const router = express.Router();
const essayController = require('../controllers/essayController');

// Public gallery — no auth required so all aspirants can view top answers
router.get('/', essayController.getAnswerGallery);

module.exports = router;
