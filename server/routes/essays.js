const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const essayController = require('../controllers/essayController');

router.use(auth);

router.get('/', essayController.getEssayThemes);
router.get('/:id', essayController.getEssayTheme);
router.post('/', essayController.createEssayTheme);

module.exports = router;
