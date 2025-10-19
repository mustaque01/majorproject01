/**
 * REAL AUTHENTICATION ROUTES
 * Production-ready Express routes for user authentication
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
} = require('../controllers/authController');

const {
    authenticateUser,
    authorizeRoles,
    authorizePermissions,
    createRateLimit,
    logUserActivity
} = require('../middleware/authReal');

// Rate limiting for authentication endpoints
const authRateLimit = createRateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes
const generalRateLimit = createRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Student or Instructor)
 * @access  Public
 * @body    { firstName, lastName, email, password, role, institution?, department?, experience?, specialization? }
 */
router.post('/register', 
    authRateLimit,
    logUserActivity('user_registration'),
    registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT tokens
 * @access  Public
 * @body    { email, password, role }
 */
router.post('/login',
    authRateLimit,
    logUserActivity('user_login'),
    loginUser
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate refresh token
 * @access  Private (Authenticated users only)
 * @body    { refreshToken? }
 */
router.post('/logout',
    generalRateLimit,
    authenticateUser,
    logUserActivity('user_logout'),
    logoutUser
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (Authenticated users only)
 */
router.get('/me',
    generalRateLimit,
    authenticateUser,
    logUserActivity('profile_access'),
    getCurrentUser
);

/**
 * @route   PUT /api/auth/me
 * @desc    Update current user profile
 * @access  Private (Authenticated users only)
 * @body    { firstName?, lastName?, institution?, department?, experience?, specialization? }
 */
router.put('/me',
    generalRateLimit,
    authenticateUser,
    logUserActivity('profile_update'),
    async (req, res) => {
        try {
            console.log('📝 Profile update request for:', req.user.email);

            const {
                firstName,
                lastName,
                institution,
                department,
                experience,
                specialization
            } = req.body;

            // Validate input
            const updates = {};
            if (firstName?.trim()) updates.firstName = firstName.trim();
            if (lastName?.trim()) updates.lastName = lastName.trim();

            // Role-specific updates
            if (req.user.role === 'student' && institution?.trim()) {
                updates.institution = institution.trim();
            }

            if (req.user.role === 'instructor') {
                if (department?.trim()) updates.department = department.trim();
                if (experience?.trim()) updates.experience = experience.trim();
                if (specialization?.trim()) updates.specialization = specialization.trim();
            }

            // Update user
            const updatedUser = await req.user.updateOne(updates, { new: true });

            // Get updated user data
            const user = await require('../models/UserReal').findById(req.user._id);

            console.log('✅ Profile updated successfully for:', user.email);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        institution: user.institution,
                        department: user.department,
                        experience: user.experience,
                        specialization: user.specialization
                    }
                }
            });

        } catch (error) {
            console.error('💥 Profile update error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating profile'
            });
        }
    }
);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin only)
 */
router.get('/users',
    generalRateLimit,
    authenticateUser,
    authorizeRoles('admin'),
    logUserActivity('admin_view_users'),
    async (req, res) => {
        try {
            console.log('📋 Admin viewing all users');

            const User = require('../models/UserReal');
            const users = await User.find({ isActive: true })
                .select('-refreshTokens -emailVerificationToken -passwordResetToken')
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: {
                    users: users.map(user => ({
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                        permissions: user.permissions,
                        institution: user.institution,
                        department: user.department,
                        isActive: user.isActive,
                        isEmailVerified: user.isEmailVerified,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt
                    })),
                    count: users.length
                }
            });

        } catch (error) {
            console.error('💥 Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving users'
            });
        }
    }
);

/**
 * @route   GET /api/auth/students
 * @desc    Get all students (Instructor and Admin only)
 * @access  Private (Instructor, Admin)
 */
router.get('/students',
    generalRateLimit,
    authenticateUser,
    authorizeRoles('instructor', 'admin'),
    logUserActivity('view_students'),
    async (req, res) => {
        try {
            console.log('🎓 Viewing students list');

            const User = require('../models/UserReal');
            const students = await User.find({ 
                role: 'student', 
                isActive: true 
            })
            .select('firstName lastName email institution lastLoginAt createdAt')
            .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: {
                    students,
                    count: students.length
                }
            });

        } catch (error) {
            console.error('💥 Get students error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving students'
            });
        }
    }
);

/**
 * @route   GET /api/auth/instructors
 * @desc    Get all instructors (Admin only)
 * @access  Private (Admin only)
 */
router.get('/instructors',
    generalRateLimit,
    authenticateUser,
    authorizeRoles('admin'),
    logUserActivity('admin_view_instructors'),
    async (req, res) => {
        try {
            console.log('👨‍🏫 Admin viewing instructors list');

            const User = require('../models/UserReal');
            const instructors = await User.find({ 
                role: 'instructor', 
                isActive: true 
            })
            .select('firstName lastName email department experience specialization lastLoginAt createdAt')
            .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: {
                    instructors,
                    count: instructors.length
                }
            });

        } catch (error) {
            console.error('💥 Get instructors error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving instructors'
            });
        }
    }
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private (Authenticated users only)
 * @body    { currentPassword, newPassword }
 */
router.post('/change-password',
    generalRateLimit,
    authenticateUser,
    logUserActivity('password_change'),
    async (req, res) => {
        try {
            console.log('🔐 Password change request for:', req.user.email);

            const { currentPassword, newPassword } = req.body;

            // Validate input
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            // Get user with password
            const User = require('../models/UserReal');
            const user = await User.findById(req.user._id).select('+password');

            // Verify current password
            const isCurrentPasswordValid = await user.comparePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            user.password = newPassword;
            await user.save();

            // Clear all refresh tokens (logout from all devices)
            user.refreshTokens = [];
            await user.save();

            console.log('✅ Password changed successfully for:', user.email);

            res.json({
                success: true,
                message: 'Password changed successfully. Please login again.'
            });

        } catch (error) {
            console.error('💥 Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error changing password'
            });
        }
    }
);

/**
 * @route   DELETE /api/auth/me
 * @desc    Delete user account
 * @access  Private (Authenticated users only)
 * @body    { password }
 */
router.delete('/me',
    generalRateLimit,
    authenticateUser,
    logUserActivity('account_deletion'),
    async (req, res) => {
        try {
            console.log('🗑️ Account deletion request for:', req.user.email);

            const { password } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Password confirmation required for account deletion'
                });
            }

            // Get user with password
            const User = require('../models/UserReal');
            const user = await User.findById(req.user._id).select('+password');

            // Verify password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Incorrect password'
                });
            }

            // Soft delete - mark as inactive
            user.isActive = false;
            user.email = `deleted_${Date.now()}_${user.email}`;
            user.refreshTokens = [];
            await user.save();

            console.log('✅ Account deleted successfully for:', req.user.email);

            res.json({
                success: true,
                message: 'Account deleted successfully'
            });

        } catch (error) {
            console.error('💥 Delete account error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting account'
            });
        }
    }
);

/**
 * @route   GET /api/auth/stats
 * @desc    Get authentication statistics (Admin only)
 * @access  Private (Admin only)
 */
router.get('/stats',
    generalRateLimit,
    authenticateUser,
    authorizeRoles('admin'),
    logUserActivity('admin_view_stats'),
    async (req, res) => {
        try {
            console.log('📊 Admin viewing authentication stats');

            const User = require('../models/UserReal');

            const stats = await Promise.all([
                User.countDocuments({ isActive: true }),
                User.countDocuments({ role: 'student', isActive: true }),
                User.countDocuments({ role: 'instructor', isActive: true }),
                User.countDocuments({ role: 'admin', isActive: true }),
                User.countDocuments({ isEmailVerified: true, isActive: true }),
                User.countDocuments({ 
                    lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                    isActive: true 
                }),
                User.countDocuments({ 
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                    isActive: true 
                })
            ]);

            res.json({
                success: true,
                data: {
                    totalUsers: stats[0],
                    students: stats[1],
                    instructors: stats[2],
                    admins: stats[3],
                    emailVerified: stats[4],
                    activeToday: stats[5],
                    newThisWeek: stats[6]
                }
            });

        } catch (error) {
            console.error('💥 Get stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving statistics'
            });
        }
    }
);

module.exports = router;