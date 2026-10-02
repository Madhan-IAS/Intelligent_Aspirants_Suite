const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_123456789',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret123456789',
});

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
    try {
        const { amount, tier, durationMonths } = req.body;
        if (!amount || !tier) return res.status(400).json({ message: 'Amount and tier required' });

        const options = {
            amount: parseInt(amount) * 100, // Razorpay works in paise (amount * 100)
            currency: 'INR',
            receipt: `rcpt_${req.user.id.substring(0, 6)}_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);
        res.json({ order });
    } catch (error) {
        console.error('Razorpay Error:', error);
        res.status(500).json({ message: 'Failed to create Razorpay payment order' });
    }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier, durationMonths } = req.body;

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret123456789')
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature. Verification failed.' });
        }

        // Signature is valid -> Activate the subscription automatically!
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + parseInt(durationMonths || 1));

        user.subscriptionStatus = 'active';
        user.subscriptionTier = tier;
        user.subscriptionExpiry = expiry;

        await user.save();

        res.json({ message: 'Payment successfully verified. Welcome to Premium!' });
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};
