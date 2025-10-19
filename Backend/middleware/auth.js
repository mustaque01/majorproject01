const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'your-super-secret-jwt-key-here';

// Middleware to verify JWT token and authenticate user
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not active.'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('🔐 Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Middleware to authorize specific roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// Middleware to check if user owns the resource
const authorizeOwnership = (req, res, next) => {
    // This can be customized based on your needs
    // For example, checking if user._id matches the resource owner
    if (req.params.userId && req.params.userId !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own resources.'
        });
    }
    next();
};

// Rate limiting middleware (basic implementation)
const rateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();

    return (req, res, next) => {
        const identifier = req.ip + req.path;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [key, value] of attempts.entries()) {
            if (value.timestamp < windowStart) {
                attempts.delete(key);
            }
        }

        // Check current attempts
        const currentAttempts = attempts.get(identifier);
        if (currentAttempts && currentAttempts.count >= maxAttempts) {
            return res.status(429).json({
                success: false,
                message: 'Too many attempts. Please try again later.'
            });
        }

        // Record this attempt
        if (currentAttempts) {
            currentAttempts.count++;
        } else {
            attempts.set(identifier, { count: 1, timestamp: now });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizeOwnership,
    rateLimiter
};