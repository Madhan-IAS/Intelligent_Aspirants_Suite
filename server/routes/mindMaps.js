const express = require('express');
const router = express.Router();
const mindMapController = require('../controllers/mindMapController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
router.get('/subjects', mindMapController.getSubjectsByPaper);
router.get('/', mindMapController.getAllMindMaps);
router.get('/:id', mindMapController.getMindMapById);
router.post('/', auth, requireAdmin, mindMapController.createMindMap);
router.put('/:id', auth, requireAdmin, mindMapController.updateMindMap);
router.delete('/:id', auth, requireAdmin, mindMapController.deleteMindMap);

module.exports = router;
