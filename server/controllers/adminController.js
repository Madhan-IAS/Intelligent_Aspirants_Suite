const User = require('../models/User');
const Subscription = require('../models/Subscription');

// GET /api/admin/pending
// List all users with pending_review subscription status
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({
            subscriptionStatus: { $in: ['pending', 'pending_review'] }
        }).select('-passwordHash').sort({ createdAt: -1 });

        // Attach latest subscription proof for each user
        const usersWithProof = await Promise.all(users.map(async (user) => {
            const proof = await Subscription.findOne({ userId: user._id }).sort({ createdAt: -1 });
            return {
                ...user.toObject(),
                latestProof: proof || null
            };
        }));

        res.json(usersWithProof);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/all-users
// List all users for admin overview
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-passwordHash')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/approve/:id
// Approve a user's subscription
exports.approveUser = async (req, res) => {
    try {
        const { durationMonths, tier } = req.body; // How many months + which tier
        const months = durationMonths || 1; // Default 1 month
        const selectedTier = tier || 'foundation'; // Default foundation

        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + months);

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                subscriptionStatus: 'active',
                subscriptionTier: selectedTier,
                subscriptionExpiry: expiry,
                isTrial: false,
                usageStats: {
                    aiQuizGenerated: 0,
                    aiQuestionGenerated: 0,
                    aiAnswerEvaluations: 0,
                    aiEssayEvaluations: 0,
                    aiTopicSummaries: 0,
                    aiRecommendations: 0,
                    aiAnalyticPrompts: 0,
                    customFlashcards: 0,
                    customNotes: 0
                }
            },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update the subscription proof record
        await Subscription.findOneAndUpdate(
            { userId: req.params.id, status: 'pending' },
            {
                status: 'approved',
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
                reviewNote: `Approved for ${months} month(s)`
            }
        );

        res.json({ message: `User approved for ${months} month(s)`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/reject/:id
// Reject a user's subscription
exports.rejectUser = async (req, res) => {
    try {
        const { reason } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { subscriptionStatus: 'rejected' },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        await Subscription.findOneAndUpdate(
            { userId: req.params.id, status: 'pending' },
            {
                status: 'rejected',
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
                reviewNote: reason || 'Payment could not be verified'
            }
        );

        res.json({ message: 'User subscription rejected', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/revoke/:id
// Revoke an active user's subscription instantly
exports.revokeUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                subscriptionStatus: 'expired',
                subscriptionTier: 'foundation'
            },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update the latest granted proof mathematically for history
        await Subscription.findOneAndUpdate(
            { userId: req.params.id, status: 'approved' },
            {
                status: 'rejected',
                reviewNote: 'Subscription revoked by Administrator'
            },
            { sort: { createdAt: -1 } }
        );

        res.json({ message: 'User subscription has been revoked successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/admin/user/:id
// Hard delete a user entirely (CRUD operation)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clean up stray subscriptions
        await Subscription.deleteMany({ userId: req.params.id });

        res.json({ message: 'User permanently deleted from the platform', deletedUserId: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
