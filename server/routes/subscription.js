const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

router.post('/submit-proof', auth, subscriptionController.submitProof);
router.post('/request', auth, subscriptionController.requestSubscription);
router.get('/my-status', auth, subscriptionController.getMyStatus);
router.get('/history', auth, subscriptionController.getHistory);

module.exports = router;
