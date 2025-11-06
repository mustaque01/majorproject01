/**
 * REAL USER AUTHENTICATION CONTROLLER
 * Production-ready implementation without any mock data
 * Handles actual user registration and login with MongoDB
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserReal');
const validator = require('validator');

// JWT Configuration
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-2024';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

/**
 * REAL USER REGISTRATION HANDLER
 * Creates actual users in MongoDB database
 */
const registerUser = async (req, res) => {
    try {
        console.log('🔍 Registration attempt started');
        console.log('📦 Request data:', {
            ...req.body,
            password: '[REDACTED]'
        });

        // 1. EXTRACT AND VALIDATE INPUT DATA
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            institution,
            department,
            experience,
            specialization
        } = req.body;

        // 2. COMPREHENSIVE INPUT VALIDATION
        const validationErrors = [];

        // Required field validation
        if (!firstName?.trim()) validationErrors.push('First name is required');
        if (!lastName?.trim()) validationErrors.push('Last name is required');
        if (!email?.trim()) validationErrors.push('Email is required');
        if (!password) validationErrors.push('Password is required');
        if (!role) validationErrors.push('Role is required');

        // Email format validation
        if (email && !validator.isEmail(email)) {
            validationErrors.push('Please provide a valid email address');
        }

        // Password strength validation
        if (password && password.length < 6) {
            validationErrors.push('Password must be at least 6 characters long');
        }

        // Role validation
        if (role && !['student', 'instructor', 'admin'].includes(role)) {
            validationErrors.push('Role must be student, instructor, or admin');
        }

        // Return validation errors
        if (validationErrors.length > 0) {
            console.log('❌ Validation failed:', validationErrors);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // 3. CHECK IF USER ALREADY EXISTS
        console.log('🔍 Checking if user already exists with email:', email.toLowerCase());
        
        const existingUser = await User.findOne({ 
            email: email.toLowerCase().trim() 
        });

        if (existingUser) {
            console.log('❌ User already exists with this email');
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists'
            });
        }

        // 4. PASSWORD WILL BE HASHED BY MODEL PRE-SAVE HOOK
        console.log('🔐 Password will be hashed by model...');

        // 5. SET ROLE-BASED PERMISSIONS
        let permissions = [];
        switch (role) {
            case 'student':
                permissions = ['read:courses', 'read:profile'];
                break;
            case 'instructor':
                permissions = ['read:courses', 'write:courses', 'read:profile', 'write:profile', 'read:students'];
                break;
            case 'admin':
                permissions = ['admin:all'];
                break;
            default:
                permissions = ['read:profile'];
                break;
        }

        // 6. PREPARE USER DATA FOR DATABASE
        const userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            role,
            permissions,
            isActive: true,
            isEmailVerified: false,
            lastLoginAt: new Date(),
            loginAttempts: 0,
            refreshTokens: []
        };

        // Add role-specific fields
        if (role === 'student' && institution?.trim()) {
            userData.institution = institution.trim();
        }

        if (role === 'instructor') {
            if (department?.trim()) userData.department = department.trim();
            if (experience?.trim()) userData.experience = experience.trim();
            if (specialization?.trim()) userData.specialization = specialization.trim();
        }

        // 7. CREATE USER IN DATABASE
        console.log('💾 Creating user in database...');
        const newUser = new User(userData);
        const savedUser = await newUser.save();

        console.log('✅ User created successfully with ID:', savedUser._id);

        // 8. GENERATE JWT TOKENS
        const accessToken = jwt.sign(
            {
                id: savedUser._id,
                email: savedUser.email,
                role: savedUser.role,
                permissions: savedUser.permissions
            },
            JWT_ACCESS_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { id: savedUser._id },
            JWT_REFRESH_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        // 9. SAVE REFRESH TOKEN TO DATABASE
        savedUser.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date()
        });
        await savedUser.save();

        // 10. PREPARE RESPONSE (EXCLUDE SENSITIVE DATA)
        const userResponse = {
            id: savedUser._id,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            email: savedUser.email,
            role: savedUser.role,
            permissions: savedUser.permissions,
            isActive: savedUser.isActive,
            isEmailVerified: savedUser.isEmailVerified,
            institution: savedUser.institution,
            department: savedUser.department,
            experience: savedUser.experience,
            specialization: savedUser.specialization,
            createdAt: savedUser.createdAt
        };

        console.log('🎉 Registration completed successfully for:', savedUser.email);

        // 11. SEND SUCCESS RESPONSE
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('💥 Registration error:', error);

        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Generic server error
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

/**
 * REAL USER LOGIN HANDLER
 * Authenticates users against MongoDB database
 */
const loginUser = async (req, res) => {
    try {
        console.log('🔍 Login attempt started');
        console.log('📦 Login data:', {
            email: req.body.email,
            role: req.body.role,
            password: '[REDACTED]',
            ip: req.ip
        });

        // 1. EXTRACT AND VALIDATE INPUT
        const { email, password, role } = req.body;

        // Input validation
        if (!email?.trim() || !password || !role) {
            console.log('❌ Missing required login fields');
            return res.status(400).json({
                success: false,
                message: 'Email, password, and role are required'
            });
        }

        // Email format validation
        if (!validator.isEmail(email)) {
            console.log('❌ Invalid email format');
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // 2. FIND USER IN DATABASE
        console.log('🔍 Searching for user with email:', email.toLowerCase());
        
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            role: role,
            isActive: true
        }).select('+password'); // Include password field for comparison

        // Check if user exists
        if (!user) {
            console.log('❌ User not found or role mismatch');
            return res.status(401).json({
                success: false,
                message: 'Invalid email, password, or role'
            });
        }

        // 3. CHECK ACCOUNT LOCK STATUS
        const isLocked = user.lockUntil && user.lockUntil > Date.now();
        if (isLocked) {
            console.log('🔒 Account is locked');
            return res.status(423).json({
                success: false,
                message: 'Account is temporarily locked due to too many failed login attempts. Try again later.'
            });
        }

        // 4. VERIFY PASSWORD
        console.log('🔐 Verifying password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('❌ Invalid password');

            // Increment login attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            // Lock account after 5 failed attempts
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
                console.log('🔒 Account locked due to too many failed attempts');
            }

            await user.save();

            return res.status(401).json({
                success: false,
                message: 'Invalid email, password, or role'
            });
        }

        // 5. SUCCESSFUL LOGIN - RESET ATTEMPTS
        console.log('✅ Password verified successfully');

        if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
        }

        // Update last login time
        user.lastLoginAt = new Date();

        // 6. GENERATE NEW JWT TOKENS
        const accessToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
                permissions: user.permissions
            },
            JWT_ACCESS_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            JWT_REFRESH_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        // 7. SAVE REFRESH TOKEN
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date()
        });

        // Clean up old refresh tokens (keep only last 5)
        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }

        await user.save();

        // 8. PREPARE USER RESPONSE (EXCLUDE SENSITIVE DATA)
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            institution: user.institution,
            department: user.department,
            experience: user.experience,
            specialization: user.specialization,
            lastLoginAt: user.lastLoginAt
        };

        console.log('🎉 Login successful for user:', user.email);

        // 8.5. AWARD DAILY LOGIN BONUS (for students only)
        let dailyBonusInfo = null;
        if (user.role === 'student') {
            try {
                const { awardDailyLoginBonus } = require('../services/rewardService');
                dailyBonusInfo = await awardDailyLoginBonus(user._id);
            } catch (rewardError) {
                console.log('⚠️ Daily bonus error (non-critical):', rewardError.message);
            }
        }

        // 9. PREPARE RESPONSE
        const response = {
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        };

        // Include daily bonus info if awarded
        if (dailyBonusInfo && dailyBonusInfo.success && !dailyBonusInfo.alreadyAwarded) {
            response.dailyBonus = {
                coinsAwarded: dailyBonusInfo.coinsAwarded,
                newBalance: dailyBonusInfo.newBalance
            };
            response.message += ` Welcome back! You earned ${dailyBonusInfo.coinsAwarded} coins.`;
        }

        // 10. SEND SUCCESS RESPONSE
        res.json(response);

    } catch (error) {
        console.error('💥 Login error:', error);

        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

/**
 * REAL USER LOGOUT HANDLER
 * Invalidates tokens and cleans up session
 */
const logoutUser = async (req, res) => {
    try {
        console.log('🚪 Logout attempt for user:', req.user?.email);

        const { refreshToken } = req.body;

        if (refreshToken) {
            // Remove specific refresh token
            req.user.refreshTokens = req.user.refreshTokens.filter(
                tokenObj => tokenObj.token !== refreshToken
            );
        } else {
            // Remove all refresh tokens (logout from all devices)
            req.user.refreshTokens = [];
        }

        await req.user.save();

        console.log('✅ User logged out successfully:', req.user.email);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('💥 Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
};

/**
 * GET CURRENT USER PROFILE
 * Returns authenticated user's profile data
 */
const getCurrentUser = async (req, res) => {
    try {
        const userResponse = {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role,
            permissions: req.user.permissions,
            isActive: req.user.isActive,
            isEmailVerified: req.user.isEmailVerified,
            institution: req.user.institution,
            department: req.user.department,
            experience: req.user.experience,
            specialization: req.user.specialization,
            lastLoginAt: req.user.lastLoginAt,
            createdAt: req.user.createdAt
        };

        res.json({
            success: true,
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        console.error('💥 Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user profile'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
};