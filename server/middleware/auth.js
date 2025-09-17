const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

// @desc    Protect routes - Authentication middleware
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    let currentUser;
    
    if (decoded.role === 'student') {
      currentUser = await Student.findById(decoded.id).select('-password');
    } else if (decoded.role === 'instructor') {
      currentUser = await Instructor.findById(decoded.id).select('-password');
    }
    
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }
    
    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Grant access to protected route
    req.user = currentUser;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// @desc    Authorization middleware - Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// @desc    Check if user is a student
const isStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student access required.'
    });
  }
  next();
};

// @desc    Check if user is an instructor
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Instructor access required.'
    });
  }
  next();
};

// @desc    Check if user is a verified instructor
const isVerifiedInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Instructor access required.'
    });
  }
  
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Verified instructor status required.'
    });
  }
  
  next();
};

// @desc    Optional authentication - doesn't require token but sets user if valid token is provided
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      // No token provided, continue without authentication
      return next();
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    let currentUser;
    
    if (decoded.role === 'student') {
      currentUser = await Student.findById(decoded.id).select('-password');
    } else if (decoded.role === 'instructor') {
      currentUser = await Instructor.findById(decoded.id).select('-password');
    }
    
    if (currentUser && currentUser.isActive) {
      req.user = currentUser;
    }
    
    next();
    
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};

// @desc    Check if user owns the resource or is admin
const checkOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      let resource;
      
      if (resourceModel === 'Student') {
        resource = await Student.findById(resourceId);
      } else if (resourceModel === 'Instructor') {
        resource = await Instructor.findById(resourceId);
      } else {
        // For other models, you can extend this
        const Model = require(`../models/${resourceModel}`);
        resource = await Model.findById(resourceId);
      }
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      // Check ownership based on resource type
      let isOwner = false;
      
      if (resourceModel === 'Student' || resourceModel === 'Instructor') {
        isOwner = resource._id.toString() === req.user.id.toString();
      } else {
        // For courses, check if instructor created it
        if (resource.instructorId) {
          isOwner = resource.instructorId.toString() === req.user.id.toString();
        }
        // For student-specific resources, check student ownership
        if (resource.studentId) {
          isOwner = resource.studentId.toString() === req.user.id.toString();
        }
      }
      
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }
      
      req.resource = resource;
      next();
      
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      });
    }
  };
};

// @desc    Rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting solution
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  if (!req.app.locals.authAttempts) {
    req.app.locals.authAttempts = new Map();
  }
  
  const clientId = req.ip + req.body.email;
  const attempts = req.app.locals.authAttempts.get(clientId) || [];
  
  // Clean old attempts
  const recentAttempts = attempts.filter(attempt => now - attempt < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.'
    });
  }
  
  // Record this attempt
  recentAttempts.push(now);
  req.app.locals.authAttempts.set(clientId, recentAttempts);
  
  next();
};

module.exports = {
  protect,
  restrictTo,
  isStudent,
  isInstructor,
  isVerifiedInstructor,
  optionalAuth,
  checkOwnership,
  authRateLimit
};