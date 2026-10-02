const express = require('express');
const router = express.Router();
const pyqController = require('../controllers/pyqController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
router.get('/', pyqController.getAllPYQs);
router.get('/:id', pyqController.getPYQById);
router.post('/', auth, adminAuth, pyqController.createPYQ);
router.put('/:id', auth, adminAuth, pyqController.updatePYQ);
router.delete('/:id', auth, adminAuth, pyqController.deletePYQ);

module.exports = router;
