/**
 * REWARD SYSTEM ROUTES
 * API endpoints for coin rewards and notifications
 */

const express = require('express');
const router = express.Router();
const { 
    authenticateUser, 
    authorizeRoles, 
    logUserActivity 
} = require('../middleware/authReal');
const {
    awardProgressCoins,
    awardDailyLoginBonus,
    getUserCoinStats
} = require('../services/rewardService');

/**
 * @route   GET /api/rewards/coins/stats
 * @desc    Get user's coin statistics and balance
 * @access  Private (Students and Instructors)
 */
router.get('/coins/stats',
    authenticateUser,
    logUserActivity('view_coin_stats'),
    async (req, res) => {
        try {
            const stats = await getUserCoinStats(req.user._id);
            
            if (!stats) {
                return res.status(404).json({
                    success: false,
                    message: 'User stats not found'
                });
            }

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('💥 Error getting coin stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving coin statistics'
            });
        }
    }
);

/**
 * @route   POST /api/rewards/daily-bonus
 * @desc    Claim daily login bonus
 * @access  Private (Students only)
 */
router.post('/daily-bonus',
    authenticateUser,
    authorizeRoles('student'),
    logUserActivity('claim_daily_bonus'),
    async (req, res) => {
        try {
            const result = await awardDailyLoginBonus(req.user._id);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.error || 'Failed to award daily bonus'
                });
            }

            if (result.alreadyAwarded) {
                return res.json({
                    success: true,
                    message: 'Daily bonus already claimed today',
                    data: { alreadyClaimed: true }
                });
            }

            res.json({
                success: true,
                message: `Daily bonus awarded! You earned ${result.coinsAwarded} coins.`,
                data: {
                    coinsAwarded: result.coinsAwarded,
                    newBalance: result.newBalance,
                    alreadyClaimed: false
                }
            });

        } catch (error) {
            console.error('💥 Error claiming daily bonus:', error);
            res.status(500).json({
                success: false,
                message: 'Error claiming daily bonus'
            });
        }
    }
);

/**
 * @route   POST /api/rewards/course-progress
 * @desc    Award coins for course progress (manual trigger for testing)
 * @access  Private (Students only)  
 * @body    { courseId, oldProgress, newProgress, courseTitle }
 */
router.post('/course-progress',
    authenticateUser,
    authorizeRoles('student'),
    logUserActivity('course_progress_reward'),
    async (req, res) => {
        try {
            const { courseId, oldProgress, newProgress, courseTitle } = req.body;

            if (!courseId || typeof oldProgress !== 'number' || typeof newProgress !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'courseId, oldProgress, and newProgress are required'
                });
            }

            if (newProgress <= oldProgress) {
                return res.json({
                    success: true,
                    message: 'No progress advancement detected',
                    data: { coinsAwarded: 0 }
                });
            }

            const result = await awardProgressCoins(
                req.user._id,
                courseId,
                oldProgress,
                newProgress,
                courseTitle || 'Unknown Course'
            );

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.error || 'Failed to award progress coins'
                });
            }

            res.json({
                success: true,
                message: result.coinsAwarded > 0 
                    ? `Progress reward awarded! You earned ${result.coinsAwarded} coins.`
                    : 'No milestone rewards at this progress level',
                data: result
            });

        } catch (error) {
            console.error('💥 Error awarding progress coins:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing course progress reward'
            });
        }
    }
);

/**
 * @route   GET /api/rewards/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/notifications',
    authenticateUser,
    logUserActivity('view_notifications'),
    async (req, res) => {
        try {
            const { page = 1, limit = 20, unreadOnly = false } = req.query;
            
            let notifications = req.user.notifications;
            
            if (unreadOnly === 'true') {
                notifications = notifications.filter(n => !n.isRead);
            }

            // Sort by timestamp (newest first)
            notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedNotifications = notifications.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: {
                    notifications: paginatedNotifications,
                    totalCount: notifications.length,
                    unreadCount: req.user.getUnreadNotificationCount(),
                    page: parseInt(page),
                    limit: parseInt(limit),
                    hasMore: endIndex < notifications.length
                }
            });

        } catch (error) {
            console.error('💥 Error getting notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving notifications'
            });
        }
    }
);

/**
 * @route   PUT /api/rewards/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:id/read',
    authenticateUser,
    logUserActivity('mark_notification_read'),
    async (req, res) => {
        try {
            const { id } = req.params;
            
            await req.user.markNotificationAsRead(id);

            res.json({
                success: true,
                message: 'Notification marked as read'
            });

        } catch (error) {
            console.error('💥 Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating notification'
            });
        }
    }
);

/**
 * @route   GET /api/rewards/leaderboard
 * @desc    Get coin leaderboard (top earners)
 * @access  Private
 */
router.get('/leaderboard',
    authenticateUser,
    async (req, res) => {
        try {
            const { limit = 10, timeframe = 'all' } = req.query;
            const User = require('../models/UserReal');

            let matchStage = { 
                role: 'student', 
                isActive: true,
                totalCoinsEarned: { $gt: 0 }
            };

            // For time-based leaderboards, we'd need to aggregate coin transactions
            // For now, let's show all-time leaderboard
            
            const leaderboard = await User.find(matchStage)
                .select('firstName lastName totalCoinsEarned coins')
                .sort({ totalCoinsEarned: -1 })
                .limit(parseInt(limit));

            // Add rank to each user
            const rankedLeaderboard = leaderboard.map((user, index) => ({
                rank: index + 1,
                name: `${user.firstName} ${user.lastName}`,
                totalEarned: user.totalCoinsEarned,
                currentBalance: user.coins
            }));

            res.json({
                success: true,
                data: {
                    leaderboard: rankedLeaderboard,
                    timeframe,
                    userCount: leaderboard.length
                }
            });

        } catch (error) {
            console.error('💥 Error getting leaderboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving leaderboard'
            });
        }
    }
);

module.exports = router;