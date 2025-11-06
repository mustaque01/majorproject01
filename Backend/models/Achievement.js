/**
 * ACHIEVEMENT MODEL
 * Represents user achievements and badges in the learning system
 */

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    // Achievement Metadata
    title: {
        type: String,
        required: [true, 'Achievement title is required'],
        trim: true,
        unique: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [300, 'Description cannot exceed 300 characters']
    },
    icon: {
        type: String,
        required: true,
        default: 'fas fa-trophy'
    },
    category: {
        type: String,
        required: true,
        enum: ['learning', 'completion', 'streak', 'social', 'milestone', 'skill'],
        default: 'learning'
    },
    
    // Achievement Criteria
    criteria: {
        type: {
            type: String,
            required: true,
            enum: [
                'courses_completed', 'paths_completed', 'study_streak', 'study_hours',
                'resources_added', 'notes_created', 'perfect_scores', 'skill_mastery',
                'login_streak', 'early_bird', 'night_owl', 'weekend_warrior'
            ]
        },
        target: {
            type: Number,
            required: true,
            min: 1
        },
        timeframe: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly', 'all_time'],
            default: 'all_time'
        }
    },
    
    // Reward Information
    points: {
        type: Number,
        required: true,
        default: 10,
        min: 1
    },
    badge: {
        color: {
            type: String,
            default: '#3B82F6'
        },
        rarity: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
            default: 'common'
        }
    },
    
    // Achievement Status
    isActive: {
        type: Boolean,
        default: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'easy'
    },
    
    // Statistics
    totalEarned: {
        type: Number,
        default: 0
    },
    
    // Created by system or admin
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// User Achievement Progress Schema
const userAchievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    achievementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Achievement',
        required: true
    },
    
    // Progress Tracking
    currentProgress: {
        type: Number,
        default: 0,
        min: 0
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    
    // Progress Details
    progressHistory: [{
        date: {
            type: Date,
            default: Date.now
        },
        increment: Number,
        total: Number,
        note: String
    }],
    
    // Notification Status
    notificationSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound index for user achievements
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, isCompleted: 1 });
userAchievementSchema.index({ achievementId: 1, isCompleted: 1 });

// Index for achievements
achievementSchema.index({ category: 1, isActive: 1 });
achievementSchema.index({ 'criteria.type': 1 });
achievementSchema.index({ difficulty: 1, 'badge.rarity': 1 });

// Method to check if achievement is earned
userAchievementSchema.methods.checkCompletion = async function() {
    const achievement = await mongoose.model('Achievement').findById(this.achievementId);
    
    if (!achievement) return false;
    
    if (this.currentProgress >= achievement.criteria.target && !this.isCompleted) {
        this.isCompleted = true;
        this.completedAt = new Date();
        
        // Update total earned count
        await mongoose.model('Achievement').findByIdAndUpdate(
            this.achievementId,
            { $inc: { totalEarned: 1 } }
        );
        
        return true;
    }
    
    return false;
};

// Method to increment progress
userAchievementSchema.methods.incrementProgress = async function(amount = 1, note = '') {
    this.currentProgress += amount;
    
    this.progressHistory.push({
        date: new Date(),
        increment: amount,
        total: this.currentProgress,
        note: note
    });
    
    const wasCompleted = await this.checkCompletion();
    await this.save();
    
    return wasCompleted;
};

// Static method to get user achievements
userAchievementSchema.statics.getUserAchievements = async function(userId, filter = {}) {
    const query = { userId, ...filter };
    
    return this.find(query)
        .populate('achievementId')
        .sort({ completedAt: -1, createdAt: -1 });
};

// Static method to get user statistics
userAchievementSchema.statics.getUserStats = async function(userId) {
    const totalAchievements = await mongoose.model('Achievement').countDocuments({ isActive: true });
    const userAchievements = await this.find({ userId });
    
    const completed = userAchievements.filter(ua => ua.isCompleted).length;
    const inProgress = userAchievements.filter(ua => !ua.isCompleted && ua.currentProgress > 0).length;
    // Calculate total points properly (avoid async reduce trap)
    let totalPoints = 0;
    const completedUAs = userAchievements.filter(ua => ua.isCompleted);
    for (const ua of completedUAs) {
        const achievement = await mongoose.model('Achievement').findById(ua.achievementId);
        totalPoints += (achievement?.points || 0);
    }

    return {
        totalAchievements,
        completed,
        inProgress,
        completionRate: totalAchievements > 0 ? Math.round((completed / totalAchievements) * 100) : 0,
        totalPoints
    };
};

// Static method to update user progress for specific criteria
userAchievementSchema.statics.updateUserProgress = async function(userId, criteriaType, increment = 1) {
    try {
        // Find all achievements matching the criteria type
        const achievements = await mongoose.model('Achievement').find({
            'criteria.type': criteriaType,
            isActive: true
        });
        
        const updates = [];
        
        for (const achievement of achievements) {
            // Find or create user achievement record
            let userAchievement = await this.findOne({
                userId,
                achievementId: achievement._id
            });
            
            if (!userAchievement) {
                userAchievement = new this({
                    userId,
                    achievementId: achievement._id,
                    currentProgress: 0
                });
            }
            
            // Check timeframe constraints
            const now = new Date();
            let shouldIncrement = true;
            
            if (achievement.criteria.timeframe !== 'all_time') {
                // For time-based achievements, we need to check the timeframe
                const timeframeStart = getTimeframeStart(achievement.criteria.timeframe, now);
                const recentProgress = userAchievement.progressHistory.filter(
                    p => p.date >= timeframeStart
                ).reduce((sum, p) => sum + p.increment, 0);
                
                if (recentProgress >= achievement.criteria.target) {
                    shouldIncrement = false;
                }
            }
            
            if (shouldIncrement && !userAchievement.isCompleted) {
                const wasCompleted = await userAchievement.incrementProgress(increment);
                if (wasCompleted) {
                    updates.push({
                        achievement: achievement.title,
                        points: achievement.points
                    });
                }
            }
        }
        
        return updates;
    } catch (error) {
        console.error('Error updating user progress:', error);
        return [];
    }
};

// Helper function to get timeframe start date
function getTimeframeStart(timeframe, now) {
    const date = new Date(now);
    
    switch (timeframe) {
        case 'daily':
            date.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            const dayOfWeek = date.getDay();
            date.setDate(date.getDate() - dayOfWeek);
            date.setHours(0, 0, 0, 0);
            break;
        case 'monthly':
            date.setDate(1);
            date.setHours(0, 0, 0, 0);
            break;
        case 'yearly':
            date.setMonth(0, 1);
            date.setHours(0, 0, 0, 0);
            break;
        default:
            return new Date(0); // All time
    }
    
    return date;
}

const Achievement = mongoose.model('Achievement', achievementSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = {
    Achievement,
    UserAchievement
};