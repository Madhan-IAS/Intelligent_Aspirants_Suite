const express = require('express');
const router = express.Router();
const pyqController = require('../controllers/pyqController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
router.get('/', pyqController.getAllPYQs);
router.get('/:id', pyqController.getPYQById);
router.post('/', auth, requireAdmin, pyqController.createPYQ);
router.put('/:id', auth, requireAdmin, pyqController.updatePYQ);
router.delete('/:id', auth, requireAdmin, pyqController.deletePYQ);

module.exports = router;
