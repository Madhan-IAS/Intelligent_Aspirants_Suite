const express = require('express');
const router = express.Router();
const interlinkageController = require('../controllers/interlinkageController');

router.get('/:topicId', interlinkageController.getInterlinkages);
router.post('/', interlinkageController.createInterlinkage);
router.delete('/:id', interlinkageController.deleteInterlinkage);

module.exports = router;
