const rateLimit = require('express-rate-limit');

// Limits login/register paths to 5 attempts per 15 minutes per IP to block brute-force
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many authentication attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API protection (for AI endpoints) to protect LLM token limits and billing
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 requests per 15 mins
    message: { message: 'API rate limit exceeded to protect platform resources. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
