/**
 * ACHIEVEMENT ROUTES
 * API endpoints for achievement system
 */

const express = require('express');
const router = express.Router();
const {
    getAllAchievements,
    getAchievementById,
    getUserAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    updateUserProgress,
    incrementUserProgress,
    getLeaderboard
} = require('../controllers/achievementController');

const { authenticateUser, authorizeRoles } = require('../middleware/authReal');

// Public routes
router.get('/', getAllAchievements);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getAchievementById);

// Protected routes (authenticated users)
router.use(authenticateUser); // All routes below require authentication

// User achievement routes
router.get('/user/me', getUserAchievements);

// Admin routes (admin/instructor only)
router.post('/', authorizeRoles('admin', 'instructor'), createAchievement);
router.put('/:id', authorizeRoles('admin', 'instructor'), updateAchievement);
router.delete('/:id', authorizeRoles('admin'), deleteAchievement);

// Progress management routes
router.post('/progress/update', authorizeRoles('admin'), updateUserProgress);
router.post('/progress/:userId/:achievementId', authorizeRoles('admin'), incrementUserProgress);

module.exports = router;