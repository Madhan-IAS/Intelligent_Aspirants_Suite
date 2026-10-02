const express = require('express');
const router = express.Router();
const caController = require('../controllers/currentAffairsController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
router.get('/', caController.getAllCurrentAffairs);
router.get('/topic/:topicId', caController.getArticlesByTopic);
router.post('/', auth, requireAdmin, caController.createArticle);
router.post('/refresh', auth, requireAdmin, caController.refreshCurrentAffairs);
router.patch('/:id/toggle-save', auth, caController.toggleSaveArticle);
router.put('/:id', auth, requireAdmin, caController.updateArticle);
router.delete('/:id', auth, requireAdmin, caController.deleteArticle);

module.exports = router;
