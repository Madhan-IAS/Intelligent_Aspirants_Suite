const express = require('express');
const router = express.Router();
const mindMapController = require('../controllers/mindMapController');

router.get('/subjects', mindMapController.getSubjectsByPaper);
router.get('/', mindMapController.getAllMindMaps);
router.get('/:id', mindMapController.getMindMapById);
router.post('/', mindMapController.createMindMap);
router.put('/:id', mindMapController.updateMindMap);
router.delete('/:id', mindMapController.deleteMindMap);

module.exports = router;
