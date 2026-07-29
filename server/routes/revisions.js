const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revisionController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', revisionController.getPendingRevisions);
router.get('/pending', revisionController.getPendingRevisions);
router.post('/initial', revisionController.scheduleInitialRevision);
router.post('/:id/complete', revisionController.completeRevision);

module.exports = router;
