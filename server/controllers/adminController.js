const User = require('../models/User');
const Subscription = require('../models/Subscription');

// GET /api/admin/pending
// List all users with pending_review subscription status
exports.getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({
            $or: [
                { subscriptionStatus: { $in: ['pending', 'pending_review', 'expired'] } },
                { subscriptionStatus: { $exists: false } },
                { subscriptionStatus: null }
            ]
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
// Approve a user's subscription (with custom plan support)
exports.approveUser = async (req, res) => {
    try {
        const { durationMonths, tier, customExpiryDate, aiEssayLimitOverride, adminNote, selectedTier: fallbackTier, approvedAmount: manualAmount, paymentMethod } = req.body;

        const TIER_PRICES = {
            foundation: { monthly: 99, annual: 999 },
            aspirant: { monthly: 199, annual: 1999 },
            topper: { monthly: 299, annual: 2999 }
        };

        const finalTier = tier || fallbackTier || 'foundation';
        const months = durationMonths || 1;

        // Set expiry logic
        let expiry = new Date();
        if (customExpiryDate) {
            expiry = new Date(customExpiryDate);
        } else {
            expiry.setMonth(expiry.getMonth() + months);
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                subscriptionStatus: 'active',
                subscriptionTier: finalTier,
                subscriptionExpiry: expiry,
                isTrial: false,
                usageStats: {
                    aiQuizGenerated: 0,
                    aiQuestionGenerated: 0,
                    aiAnswerEvaluations: 0,
                    aiEssayEvaluations: aiEssayLimitOverride || 0,
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

        // Auto-calculate amount from tier pricing if not manually set
        const sub = await Subscription.findOne({ userId: req.params.id, status: 'pending' }).sort({ createdAt: -1 });
        const isAnnual = sub?.isAnnual || (months === 12);
        const tierPrice = TIER_PRICES[finalTier] || TIER_PRICES.foundation;
        const finalMethod = paymentMethod || 'manual';

        let finalAmount;
        if (manualAmount !== undefined && manualAmount !== null && manualAmount !== '') {
            finalAmount = Number(manualAmount);
        } else if (finalMethod === 'scholarship') {
            finalAmount = 0;
        } else {
            finalAmount = isAnnual ? tierPrice.annual : tierPrice.monthly * months;
        }

        // Update the subscription proof record if exists, or create a new ledger entry if manual
        await Subscription.findOneAndUpdate(
            { userId: req.params.id, status: 'pending' },
            {
                $set: {
                    status: 'approved',
                    reviewedBy: req.user.id,
                    reviewedAt: new Date(),
                    reviewNote: customExpiryDate ? `Custom approval until ${expiry.toISOString().split('T')[0]}` : `Approved for ${months} month(s)`,
                    adminNote: adminNote || '',
                    approvedTier: finalTier,
                    approvedDuration: months,
                    approvedExpiry: expiry,
                    approvedAmount: finalAmount,
                    paymentMethod: finalMethod,
                    isAnnual: isAnnual
                },
                $setOnInsert: {
                    requestedTier: finalTier, // fallback if this is a purely manual approval
                }
            },
            { new: true, upsert: true }
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

// PUT /api/admin/update-name/:id
// Admin updates a user's display name
exports.updateUserName = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name cannot be empty' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User name updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/revenue
// Revenue analytics for the admin dashboard
exports.getRevenueAnalytics = async (req, res) => {
    try {
        const allApproved = await Subscription.find({ status: 'approved', approvedAmount: { $exists: true } });

        const totalRevenue = allApproved.reduce((sum, s) => sum + (s.approvedAmount || 0), 0);

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthRevenue = allApproved
            .filter(s => s.reviewedAt && new Date(s.reviewedAt) >= startOfMonth)
            .reduce((sum, s) => sum + (s.approvedAmount || 0), 0);

        // By tier
        const revenueByTier = { foundation: 0, aspirant: 0, topper: 0 };
        allApproved.forEach(s => {
            if (s.approvedTier && revenueByTier.hasOwnProperty(s.approvedTier)) {
                revenueByTier[s.approvedTier] += (s.approvedAmount || 0);
            }
        });

        // By method
        const revenueByMethod = { manual: 0, gateway: 0, scholarship: 0 };
        allApproved.forEach(s => {
            const method = s.paymentMethod || 'manual';
            if (revenueByMethod.hasOwnProperty(method)) {
                revenueByMethod[method] += (s.approvedAmount || 0);
            }
        });

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
            const monthRevenue = allApproved
                .filter(s => s.reviewedAt && new Date(s.reviewedAt) >= d && new Date(s.reviewedAt) <= end)
                .reduce((sum, s) => sum + (s.approvedAmount || 0), 0);
            monthlyTrend.push({ month: monthLabel, revenue: monthRevenue });
        }

        res.json({ totalRevenue, thisMonthRevenue, revenueByTier, revenueByMethod, monthlyTrend });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/payment-history
// Full approval/rejection ledger
exports.getPaymentHistory = async (req, res) => {
    try {
        const history = await Subscription.find({ status: { $in: ['approved', 'rejected'] } })
            .populate('userId', 'name email')
            .populate('reviewedBy', 'name')
            .sort({ reviewedAt: -1 });

        const records = history.map(s => ({
            _id: s._id,
            userName: s.userId?.name || 'Deleted User',
            userEmail: s.userId?.email || '',
            requestedTier: s.requestedTier,
            isAnnual: s.isAnnual,
            approvedTier: s.approvedTier,
            approvedDuration: s.approvedDuration,
            approvedExpiry: s.approvedExpiry,
            approvedAmount: s.approvedAmount || 0,
            paymentMethod: s.paymentMethod || 'manual',
            status: s.status,
            reviewNote: s.reviewNote,
            adminNote: s.adminNote,
            reviewedBy: s.reviewedBy?.name || 'System',
            reviewedAt: s.reviewedAt,
            createdAt: s.createdAt
        }));

        // Summary counts
        const totalApproved = records.filter(r => r.status === 'approved').length;
        const totalRejected = records.filter(r => r.status === 'rejected').length;
        const totalCollected = records.filter(r => r.status === 'approved').reduce((s, r) => s + r.approvedAmount, 0);

        res.json({
            summary: { total: records.length, approved: totalApproved, rejected: totalRejected, collected: totalCollected },
            records
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
