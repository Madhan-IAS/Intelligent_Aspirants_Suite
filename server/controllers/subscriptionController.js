const Subscription = require('../models/Subscription');
const User = require('../models/User');

// POST /api/subscription/submit-proof
// DEPRECATED: User submits payment proof (UTR + optional screenshot)
exports.submitProof = async (req, res) => {
    return res.status(410).json({
        message: 'This endpoint is deprecated. The platform now uses the automated Request Plan flow without upfront UTR submission. Please update your client.'
    });
};

// POST /api/subscription/request
// User requests a subscription plan without UTR. Automates 3-day proxy hook.
exports.requestSubscription = async (req, res) => {
    try {
        const { requestedTier, isAnnual } = req.body;

        if (!requestedTier) {
            return res.status(400).json({ message: 'Requested tier is required' });
        }

        // Check if there is an existing pending request
        const existing = await Subscription.findOne({ userId: req.user.id, status: 'pending' });
        if (existing) {
            // Update the existing request instead of throwing error
            existing.requestedTier = requestedTier;
            existing.isAnnual = isAnnual;
            await existing.save();
        } else {
            await Subscription.create({
                userId: req.user.id,
                requestedTier,
                isAnnual: isAnnual || false
            });
        }

        // Grant 3 days temporary hook access
        const temporaryExpiry = new Date();
        temporaryExpiry.setDate(temporaryExpiry.getDate() + 3);

        const updatedUser = await User.findByIdAndUpdate(req.user.id, {
            subscriptionStatus: 'pending',
            subscriptionTier: requestedTier,
            subscriptionExpiry: temporaryExpiry,
            isTrial: true
        }, { new: true }).select('-passwordHash');

        res.status(201).json({
            message: 'Subscription requested. You have been granted 3 days temporary access while awaiting admin approval!',
            user: updatedUser
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

// GET /api/subscription/history
// User checks all their past subscription proofs
exports.getHistory = async (req, res) => {
    try {
        const history = await Subscription.find({ userId: req.user.id })
            .select('-screenshot') // exclude base64 for performance
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
