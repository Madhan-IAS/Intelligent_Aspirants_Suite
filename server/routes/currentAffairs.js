const express = require('express');
const router = express.Router();
const caController = require('../controllers/currentAffairsController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
router.get('/', caController.getAllCurrentAffairs);
router.get('/topic/:topicId', caController.getArticlesByTopic);
router.post('/', auth, adminAuth, caController.createArticle);
router.post('/refresh', auth, adminAuth, caController.refreshCurrentAffairs);
router.patch('/:id/toggle-save', auth, caController.toggleSaveArticle);
router.put('/:id', auth, adminAuth, caController.updateArticle);
router.delete('/:id', auth, adminAuth, caController.deleteArticle);

module.exports = router;
