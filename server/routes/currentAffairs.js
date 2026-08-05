const express = require('express');
const router = express.Router();
const caController = require('../controllers/currentAffairsController');

router.get('/', caController.getAllCurrentAffairs);
router.get('/topic/:topicId', caController.getArticlesByTopic);
router.post('/', caController.createArticle);
router.post('/refresh', caController.refreshCurrentAffairs);
router.patch('/:id/toggle-save', caController.toggleSaveArticle);
router.delete('/:id', caController.deleteArticle);

module.exports = router;
