const User = require('../models/User');

/**
 * Middleware to check if a Free Trial user has exceeded their AI limit.
 * @param {string} limitKey - The key inside user.usageStats (e.g. 'aiQuizGenerated')
 * @param {number} maxAllowed - The hard limit for Free Trial accounts
 */
exports.checkTrialLimit = (limitKey, maxAllowed) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            const user = await User.findById(req.user.id);
            if (!user) return res.status(401).json({ message: 'User not found' });

            // If not a trial user, no limits apply
            if (!user.isTrial) {
                return next();
            }

            // Check current usage
            const currentUsage = (user.usageStats && user.usageStats[limitKey]) || 0;

            if (currentUsage >= maxAllowed) {
                return res.status(403).json({
                    code: 'LIMIT_REACHED',
                    message: 'Free Trial Limit Reached. Please upgrade your subscription to Aspirant or Topper tier to unlock unlimited AI features.'
                });
            }

            next();
        } catch (error) {
            console.error('Error in checkTrialLimit middleware:', error);
            res.status(500).json({ message: 'Server error while checking limits' });
        }
    };
};

/**
 * Helper function to increment a usage stat (call this in the controller after successful AI generation)
 */
exports.incrementUsage = async (userId, limitKey) => {
    try {
        const incField = `usageStats.${limitKey}`;
        // Only increment if isTrial is true to save DB writes on paid users if we want, 
        // but tracking paid user usage is also good for analytical purposes.
        await User.updateOne({ _id: userId }, { $inc: { [incField]: 1 } });
    } catch (error) {
        console.error(`Failed to increment usage for ${limitKey}:`, error);
    }
};
