/**
 * REAL AUTHENTICATION MIDDLEWARE
 * Production-ready middleware for protecting routes and checking permissions
 */

const jwt = require('jsonwebtoken');
const User = require('../models/UserReal');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-2024';

/**
 * AUTHENTICATE USER MIDDLEWARE
 * Verifies JWT token and attaches user to request
 */
const authenticateUser = async (req, res, next) => {
    try {
        console.log('🔐 Authenticating user...');
        
        // Get token from header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ No token provided');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract token
        const token = authHeader.substring(7);
        
        try {
            // Verify token
            const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
            console.log('✅ Token verified for user ID:', decoded.id);
            
            // Get user from database
            const user = await User.findById(decoded.id);
            
            if (!user) {
                console.log('❌ User not found in database');
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }

            if (!user.isActive) {
                console.log('❌ User account is inactive');
                return res.status(401).json({
                    success: false,
                    message: 'Account is inactive.'
                });
            }

            if (user.isLocked) {
                console.log('❌ User account is locked');
                return res.status(423).json({
                    success: false,
                    message: 'Account is temporarily locked.'
                });
            }

            // Update last active time
            user.lastActiveAt = new Date();
            await user.save();

            // Attach user to request
            req.user = user;
            console.log('✅ User authenticated:', user.email);
            
            next();
            
        } catch (tokenError) {
            console.log('❌ Token verification failed:', tokenError.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

    } catch (error) {
        console.error('💥 Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

/**
 * AUTHORIZE ROLES MIDDLEWARE
 * Checks if user has required role(s)
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        console.log('🔒 Checking role authorization...');
        console.log('👤 User role:', req.user?.role);
        console.log('✅ Allowed roles:', allowedRoles);

        if (!req.user) {
            console.log('❌ No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.log('❌ Insufficient role permissions');
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
                userRole: req.user.role,
                requiredRoles: allowedRoles
            });
        }

        console.log('✅ Role authorization passed');
        next();
    };
};

/**
 * AUTHORIZE PERMISSIONS MIDDLEWARE
 * Checks if user has required permission(s)
 */
const authorizePermissions = (...requiredPermissions) => {
    return (req, res, next) => {
        console.log('🔑 Checking permission authorization...');
        console.log('👤 User permissions:', req.user?.permissions);
        console.log('✅ Required permissions:', requiredPermissions);

        if (!req.user) {
            console.log('❌ No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Admin has all permissions
        if (req.user.role === 'admin' || req.user.hasPermission('admin:all')) {
            console.log('✅ Admin access granted');
            return next();
        }

        // Check if user has any of the required permissions
        const hasPermission = requiredPermissions.some(permission => 
            req.user.hasPermission(permission)
        );

        if (!hasPermission) {
            console.log('❌ Insufficient permissions');
            return res.status(403).json({
                success: false,
                message: `Access denied. Required permission: ${requiredPermissions.join(' or ')}.`,
                userPermissions: req.user.permissions,
                requiredPermissions
            });
        }

        console.log('✅ Permission authorization passed');
        next();
    };
};

/**
 * AUTHORIZE OWNERSHIP MIDDLEWARE
 * Checks if user owns the resource or has admin privileges
 */
const authorizeOwnership = (userIdParam = 'userId') => {
    return (req, res, next) => {
        console.log('👤 Checking resource ownership...');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        // Admin can access any resource
        if (req.user.role === 'admin') {
            console.log('✅ Admin access granted');
            return next();
        }

        // Get resource owner ID from request params
        const resourceOwnerId = req.params[userIdParam];
        
        if (!resourceOwnerId) {
            console.log('❌ No resource owner ID found in params');
            return res.status(400).json({
                success: false,
                message: 'Resource owner ID not specified.'
            });
        }

        // Check if user owns the resource
        if (req.user._id.toString() !== resourceOwnerId) {
            console.log('❌ User does not own this resource');
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        }

        console.log('✅ Ownership verification passed');
        next();
    };
};

/**
 * OPTIONAL AUTHENTICATION MIDDLEWARE
 * Tries to authenticate but doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token provided, continue without authentication
            return next();
        }

        const token = authHeader.substring(7);
        
        try {
            const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.id);
            
            if (user && user.isActive && !user.isLocked) {
                req.user = user;
            }
        } catch (tokenError) {
            // Invalid token, continue without authentication
            console.log('Invalid token in optional auth, continuing...');
        }

        next();

    } catch (error) {
        console.error('Optional auth error:', error);
        next(); // Continue even if there's an error
    }
};

/**
 * RATE LIMITING MIDDLEWARE
 * Simple rate limiting implementation
 */
const createRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const clients = new Map();

    return (req, res, next) => {
        const clientId = req.ip + (req.user ? req.user._id : '');
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [id, data] of clients.entries()) {
            if (data.resetTime < now) {
                clients.delete(id);
            }
        }

        // Get or create client data
        let clientData = clients.get(clientId);
        if (!clientData || clientData.resetTime < now) {
            clientData = {
                count: 0,
                resetTime: now + windowMs
            };
            clients.set(clientId, clientData);
        }

        // Check rate limit
        if (clientData.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            });
        }

        // Increment count
        clientData.count++;
        
        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': maxRequests - clientData.count,
            'X-RateLimit-Reset': clientData.resetTime
        });

        next();
    };
};

/**
 * LOG USER ACTIVITY MIDDLEWARE
 * Logs user actions for audit purposes
 */
const logUserActivity = (action = 'unknown') => {
    return (req, res, next) => {
        if (req.user) {
            console.log(`📋 User Activity: ${req.user.email} performed ${action} at ${new Date().toISOString()}`);
            console.log(`📊 Request: ${req.method} ${req.path}`);
            console.log(`🌐 IP: ${req.ip}`);
        }
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizeRoles,
    authorizePermissions,
    authorizeOwnership,
    optionalAuth,
    createRateLimit,
    logUserActivity
};