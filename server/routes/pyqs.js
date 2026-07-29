const express = require('express');
const router = express.Router();
const pyqController = require('../controllers/pyqController');

router.get('/', pyqController.getAllPYQs);
router.get('/:id', pyqController.getPYQById);
router.post('/', pyqController.createPYQ);
router.delete('/:id', pyqController.deletePYQ);

module.exports = router;
