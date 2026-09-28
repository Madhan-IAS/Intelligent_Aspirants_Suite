const User = require('../models/User');

// Middleware that checks if the authenticated user is an admin
// Must be used AFTER the standard auth middleware
module.exports = async function (req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error checking admin status' });
    }
};
