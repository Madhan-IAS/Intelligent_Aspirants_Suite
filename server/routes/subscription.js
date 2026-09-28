const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

router.post('/submit-proof', auth, subscriptionController.submitProof);
router.get('/my-status', auth, subscriptionController.getMyStatus);

module.exports = router;
