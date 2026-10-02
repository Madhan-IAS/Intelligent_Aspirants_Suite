const express = require('express');
const router = express.Router();
const mindMapController = require('../controllers/mindMapController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
router.get('/subjects', mindMapController.getSubjectsByPaper);
router.get('/', mindMapController.getAllMindMaps);
router.get('/:id', mindMapController.getMindMapById);
router.post('/', auth, adminAuth, mindMapController.createMindMap);
router.put('/:id', auth, adminAuth, mindMapController.updateMindMap);
router.delete('/:id', auth, adminAuth, mindMapController.deleteMindMap);

module.exports = router;
