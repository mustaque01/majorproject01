/**
 * ACHIEVEMENT CONTROLLER
 * Handles achievement CRUD operations and user achievement tracking
 */

const { Achievement, UserAchievement } = require('../models/Achievement');

// Get all achievements (public)
const getAllAchievements = async (req, res) => {
    try {
        const { category, difficulty, rarity } = req.query;
        const filter = { isActive: true };
        
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (rarity) filter['badge.rarity'] = rarity;
        
        const achievements = await Achievement.find(filter)
            .select('-createdBy')
            .sort({ category: 1, difficulty: 1, points: 1 });
        
        res.status(200).json({
            success: true,
            data: achievements,
            count: achievements.length
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements',
            error: error.message
        });
    }
};

// Get single achievement by ID
const getAchievementById = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id)
            .populate('createdBy', 'name email role');
        
        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: achievement
        });
    } catch (error) {
        console.error('Error fetching achievement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievement',
            error: error.message
        });
    }
};

// Get user achievements (protected)
const getUserAchievements = async (req, res) => {
    try {
        const userId = req.user.id;
        const { completed, inProgress } = req.query;
        
        let filter = {};
        if (completed === 'true') filter.isCompleted = true;
        if (completed === 'false') filter.isCompleted = false;
        if (inProgress === 'true') {
            filter.isCompleted = false;
            filter.currentProgress = { $gt: 0 };
        }
        
        const userAchievements = await UserAchievement.getUserAchievements(userId, filter);
        const stats = await UserAchievement.getUserStats(userId);
        
        res.status(200).json({
            success: true,
            data: {
                achievements: userAchievements,
                stats: stats
            }
        });
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user achievements',
            error: error.message
        });
    }
};

// Create new achievement (admin only)
const createAchievement = async (req, res) => {
    try {
        const achievementData = {
            ...req.body,
            createdBy: req.user.id
        };
        
        const achievement = new Achievement(achievementData);
        await achievement.save();
        
        res.status(201).json({
            success: true,
            message: 'Achievement created successfully',
            data: achievement
        });
    } catch (error) {
        console.error('Error creating achievement:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Achievement with this title already exists'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to create achievement',
            error: error.message
        });
    }
};

// Update achievement (admin only)
const updateAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Achievement updated successfully',
            data: achievement
        });
    } catch (error) {
        console.error('Error updating achievement:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update achievement',
            error: error.message
        });
    }
};

// Delete achievement (admin only)
const deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findById(req.params.id);
        
        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: 'Achievement not found'
            });
        }
        
        // Soft delete by setting isActive to false
        achievement.isActive = false;
        await achievement.save();
        
        res.status(200).json({
            success: true,
            message: 'Achievement deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete achievement',
            error: error.message
        });
    }
};

// Update user progress for specific criteria (internal/webhook)
const updateUserProgress = async (req, res) => {
    try {
        const { userId, criteriaType, increment = 1 } = req.body;
        
        if (!userId || !criteriaType) {
            return res.status(400).json({
                success: false,
                message: 'UserId and criteriaType are required'
            });
        }
        
        const updates = await UserAchievement.updateUserProgress(userId, criteriaType, increment);
        
        res.status(200).json({
            success: true,
            message: 'User progress updated successfully',
            data: {
                updatesApplied: updates.length,
                completedAchievements: updates
            }
        });
    } catch (error) {
        console.error('Error updating user progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user progress',
            error: error.message
        });
    }
};

// Manually increment user achievement progress (admin)
const incrementUserProgress = async (req, res) => {
    try {
        const { userId, achievementId } = req.params;
        const { increment = 1, note } = req.body;
        
        let userAchievement = await UserAchievement.findOne({
            userId,
            achievementId
        });
        
        if (!userAchievement) {
            userAchievement = new UserAchievement({
                userId,
                achievementId,
                currentProgress: 0
            });
        }
        
        const wasCompleted = await userAchievement.incrementProgress(increment, note);
        
        res.status(200).json({
            success: true,
            message: wasCompleted ? 'Achievement completed!' : 'Progress updated successfully',
            data: {
                userAchievement,
                completed: wasCompleted
            }
        });
    } catch (error) {
        console.error('Error incrementing user progress:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to increment user progress',
            error: error.message
        });
    }
};

// Get achievement leaderboard (top earners)
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, category } = req.query;
        
        const pipeline = [
            {
                $match: { isCompleted: true }
            },
            {
                $group: {
                    _id: '$userId',
                    completedCount: { $sum: 1 },
                    lastCompleted: { $max: '$completedAt' }
                }
            },
            {
                $lookup: {
                    from: 'users', // Adjust collection name as needed
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    username: '$user.name',
                    email: '$user.email',
                    completedCount: 1,
                    lastCompleted: 1
                }
            },
            {
                $sort: { completedCount: -1, lastCompleted: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ];
        
        const leaderboard = await UserAchievement.aggregate(pipeline);
        
        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard',
            error: error.message
        });
    }
};

module.exports = {
    getAllAchievements,
    getAchievementById,
    getUserAchievements,
    createAchievement,
    updateAchievement,
    deleteAchievement,
    updateUserProgress,
    incrementUserProgress,
    getLeaderboard
};