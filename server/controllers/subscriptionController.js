const Subscription = require('../models/Subscription');
const User = require('../models/User');

// POST /api/subscription/submit-proof
// User submits payment proof (UTR + optional screenshot)
exports.submitProof = async (req, res) => {
    try {
        const { utrNumber, screenshot, amount } = req.body;

        if (!utrNumber) {
            return res.status(400).json({ message: 'UTR number is required' });
        }

        // Check for duplicate UTR
        const existing = await Subscription.findOne({ utrNumber });
        if (existing) {
            return res.status(400).json({ message: 'This UTR has already been submitted' });
        }

        const subscription = await Subscription.create({
            userId: req.user.id,
            utrNumber,
            screenshot,
            amount: amount || 0
        });

        // Update user status to pending_review
        await User.findByIdAndUpdate(req.user.id, { subscriptionStatus: 'pending_review' });

        res.status(201).json({
            message: 'Payment proof submitted. Awaiting admin approval.',
            subscription
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/subscription/my-status
// User checks their subscription status
exports.getMyStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('subscriptionStatus subscriptionExpiry');
        const latestSub = await Subscription.findOne({ userId: req.user.id }).sort({ createdAt: -1 });

        res.json({
            subscriptionStatus: user.subscriptionStatus,
            subscriptionExpiry: user.subscriptionExpiry,
            latestProof: latestSub ? {
                utrNumber: latestSub.utrNumber,
                status: latestSub.status,
                reviewNote: latestSub.reviewNote,
                submittedAt: latestSub.createdAt
            } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
