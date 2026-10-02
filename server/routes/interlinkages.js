const express = require('express');
const router = express.Router();
const interlinkageController = require('../controllers/interlinkageController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
router.get('/:topicId', interlinkageController.getInterlinkages);
router.post('/', auth, adminAuth, interlinkageController.createInterlinkage);
router.delete('/:id', auth, adminAuth, interlinkageController.deleteInterlinkage);

module.exports = router;
