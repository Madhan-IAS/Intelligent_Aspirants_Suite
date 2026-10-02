const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const { validate } = require('../middleware/validator');
const { body } = require('express-validator');

router.post('/submit-proof', auth, validate([
    body('utrNumber').trim().notEmpty().withMessage('UTR number is required')
]), subscriptionController.submitProof);
router.post('/request', auth, validate([
    body('requestedTier').trim().notEmpty().withMessage('Requested tier is required')
]), subscriptionController.requestSubscription);
router.get('/my-status', auth, subscriptionController.getMyStatus);
router.get('/history', auth, subscriptionController.getHistory);

// Phase 10: Razorpay Automated Checkout Routes
router.post('/create-order', auth, paymentController.createOrder);
router.post('/verify', auth, paymentController.verifyPayment);

module.exports = router;
