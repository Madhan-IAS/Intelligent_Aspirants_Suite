const User = require('../models/User');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');

// GET /api/admin/pending
// List all users with pending_review subscription status
exports.getPendingUsers = async (req, res) => {
    try {
        // Find pending subscriptions to get the user IDs who are requesting upgrades/addons
        const pendingSubs = await Subscription.find({ status: 'pending' }).select('userId');
        const pendingUserIds = pendingSubs.map(sub => sub.userId);

        const users = await User.find({
            $or: [
                { subscriptionStatus: { $in: ['pending', 'pending_review', 'expired'] } },
                { subscriptionStatus: { $exists: false } },
                { subscriptionStatus: null },
                { _id: { $in: pendingUserIds } }
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
};

// Phase 10: Curate Gallery Answers
exports.getUnfeaturedAnswers = async (req, res) => {
    try {
        const Answer = require('../models/Answer');
        const answers = await Answer.find({ isFeatured: { $ne: true }, status: 'Evaluated' })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('userId', 'name')
            .populate('pyqId', 'title');
        res.json(answers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching curate records' });
    }
};

exports.featureAnswer = async (req, res) => {
    try {
        const Answer = require('../models/Answer');
        const { id } = req.params;
        const answer = await Answer.findById(id);
        if (!answer) return res.status(404).json({ message: 'Answer not found' });

        answer.isFeatured = true;
        await answer.save();

        res.json({ message: 'Answer successfully promoted to Hall of Fame!' });
    } catch (error) {
        res.status(500).json({ message: 'Error featuring answer' });
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
            topper: { monthly: 299, annual: 2999 },
            'notes-addon': { monthly: 49, annual: 499 }
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

        const updateFields = finalTier === 'notes-addon' ? {
            hasNotesAccess: true,
            notesAccessExpiry: expiry
        } : {
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
        };

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
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

        // Log the action
        await AuditLog.create({
            adminId: req.user.id,
            action: 'APPROVE',
            targetUserId: user._id,
            details: { finalTier, months, manualAmount, paymentMethod: finalMethod }
        });
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

        await AuditLog.create({
            adminId: req.user.id,
            action: 'REJECT',
            targetUserId: user._id,
            details: { reason }
        });
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
                subscriptionTier: 'foundation',
                hasNotesAccess: false
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

        await AuditLog.create({
            adminId: req.user.id,
            action: 'REVOKE',
            targetUserId: user._id,
            details: { reason: 'Manual Revoke' }
        });
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

        await AuditLog.create({
            adminId: req.user.id,
            action: 'DELETE',
            targetUserId: req.params.id,
            details: { email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/admin/update-user/:id
// Admin updates a user's details (name, email, mobile, password)
exports.updateUserDetails = async (req, res) => {
    try {
        const { name, email, mobile, password, attemptNumber, onboardingComplete } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name cannot be empty' });
        }

        const updateFields = { name: name.trim() };

        if (email) {
            const existingEmail = await User.findOne({ email: email.trim(), _id: { $ne: req.params.id } });
            if (existingEmail) return res.status(400).json({ message: 'Email is already in use by another user' });
            updateFields.email = email.trim();
        }

        if (mobile) {
            // Optional DB check for mobile duplication, currently just adding it
            updateFields.mobile = mobile.trim();
        }

        if (password) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            updateFields.passwordHash = await bcrypt.hash(password, salt);
        }

        if (attemptNumber !== undefined) updateFields.attemptNumber = attemptNumber;
        if (onboardingComplete !== undefined) updateFields.onboardingComplete = onboardingComplete;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User details updated successfully', user });

        await AuditLog.create({
            adminId: req.user.id,
            action: 'UPDATE',
            targetUserId: user._id,
            details: { updatedFields: Object.keys(updateFields).filter(k => k !== 'passwordHash') }
        });
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

// GET /api/admin/audit-logs
// View chronological admin actions
exports.getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .populate('adminId', 'name email')
            .populate('targetUserId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Visit = require('../models/Visit');

// POST /api/admin/track-visit (Public)
// Silently increment daily visit count and current specific hourly block
exports.trackVisit = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const currentHour = new Date().getHours().toString();

        await Visit.findOneAndUpdate(
            { date: today },
            {
                $inc: {
                    count: 1,
                    [`hourlyMap.${currentHour}`]: 1
                }
            },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        // Fail silently so we don't spam client
        res.status(500).json({ success: false });
    }
};

// GET /api/admin/traffic
// Get the last 30 days of traffic mapped with new registrations
exports.getTrafficStats = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        // 1. Get raw visits
        const visits = await Visit.find({ date: { $gte: thirtyDaysAgoStr } }).sort({ date: 1 });

        // 2. Get registrations within last 30 days
        const recentUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt');

        // Compile a map of Registrations by YYYY-MM-DD
        const regMap = {};
        recentUsers.forEach(u => {
            const d = new Date(u.createdAt).toISOString().split('T')[0];
            regMap[d] = (regMap[d] || 0) + 1;
        });

        // 3. Construct chronological timeline
        const timeline = [];
        let totalVisitsToday = 0;
        let regsToday = 0;
        const todayStr = now.toISOString().split('T')[0];

        // Ensure we supply 30 days back explicitly even if missing jumps
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dStr = d.toISOString().split('T')[0];
            const vRecord = visits.find(v => v.date === dStr);
            const vCount = vRecord ? vRecord.count : 0;
            const rCount = regMap[dStr] || 0;

            timeline.push({
                date: dStr,
                visits: vCount,
                registrations: rCount,
                hourlyMap: vRecord?.hourlyMap || {}
            });

            if (dStr === todayStr) {
                totalVisitsToday = vCount;
                regsToday = rCount;
            }
        }

        res.json({
            timeline,
            summary: {
                visitsToday: totalVisitsToday,
                registrationsToday: regsToday,
                conversionRateToday: totalVisitsToday > 0 ? ((regsToday / totalVisitsToday) * 100).toFixed(1) : 0
            },
            todayHourlyMap: visits.find(v => v.date === todayStr)?.hourlyMap || {}
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Notification = require('../models/Notification');

// GET /api/admin/export-users
// Export all users to a CSV string
exports.exportUsersCSV = async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });

        // Define CSV headers
        const headers = ["ID", "Name", "Email", "Mobile", "Role", "Subscription Status", "Tier", "Optional Subject", "Target Attempt", "Attempt Number", "Onboarding Complete", "Created At"];
        const csvRows = [headers.join(',')];

        for (const u of users) {
            const row = [
                u._id,
                `"${(u.name || '').replace(/"/g, '""')}"`,
                u.email,
                u.mobile || '',
                u.role,
                u.subscriptionStatus || 'free',
                u.subscriptionTier || 'foundation',
                u.optionalSubject || 'Not decided yet',
                u.targetAttempt || '',
                u.attemptNumber || 1,
                u.onboardingComplete ? 'Yes' : 'No',
                u.createdAt ? new Date(u.createdAt).toISOString() : ''
            ];
            csvRows.push(row.join(','));
        }

        const csvString = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
        res.status(200).send(csvString);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/admin/broadcast
// Send a mass notification to all users natively inside the DB and externally via FCM Hardware Pings
exports.broadcastNotification = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        if (!title || !message) return res.status(400).json({ message: 'Title and message are required' });

        const users = await User.find({ role: 'user' }).select('_id expoPushToken');

        // Batch insertion for internal UI performance
        const notifications = users.map(u => ({
            userId: u._id,
            title,
            message,
            type: type || 'system',
            read: false,
            createdAt: new Date()
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        // Expo Hardware Ping Dispatch
        const expoMessages = [];
        for (let u of users) {
            if (u.expoPushToken && u.expoPushToken.startsWith('ExponentPushToken')) {
                expoMessages.push({
                    to: u.expoPushToken,
                    sound: 'default',
                    title: title,
                    body: message,
                    data: { type: type || 'system' }
                });
            }
        }

        if (expoMessages.length > 0) {
            try {
                const axios = require('axios');
                // Chunk limit is usually 100 for Expo HTTP API, but this natively blasts the array payload to the gateway
                await axios.post('https://exp.host/--/api/v2/push/send', expoMessages, {
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json'
                    }
                });
                console.log(`[HARDWARE PUSH] Executed to ${expoMessages.length} external devices.`);
            } catch (err) {
                console.error('[HARDWARE PUSH ERR]', err.message);
            }
        }

        // Log the action
        await AuditLog.create({
            adminId: req.user.id,
            action: 'BROADCAST',
            targetUserId: req.user.id, // Self-targeted since it's global
            details: { title, internalCount: notifications.length, nativePushCount: expoMessages.length }
        });

        res.json({ message: `Successfully broadcasted to ${notifications.length} internal users and vibrated ${expoMessages.length} hardware devices!` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/admin/demographics
// Aggregate user data representing Optionals and Targets
exports.getDemographics = async (req, res) => {
    try {
        // Aggregate Optionals
        const optionalsAgg = await User.aggregate([
            { $match: { role: 'user' } },
            { $group: { _id: { $ifNull: ["$optionalSubject", "Not decided yet"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 } // Top 10
        ]);

        // Aggregate Target Years
        const targetsAgg = await User.aggregate([
            { $match: { role: 'user' } },
            { $group: { _id: { $ifNull: ["$targetAttempt", 2026] }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            optionals: optionalsAgg.map(o => ({ subject: o._id, count: o.count })),
            targetYears: targetsAgg.map(t => ({ year: t._id, count: t.count }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
