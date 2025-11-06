/**
 * PROGRESS ANALYTICS MODEL
 * Tracks detailed user learning analytics and progress data
 */

const mongoose = require('mongoose');

const progressAnalyticsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    
    // Daily Activity Tracking
    dailyActivity: [{
        date: {
            type: Date,
            required: true
        },
        studyTime: {
            type: Number,
            default: 0 // in minutes
        },
        coursesAccessed: [{
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            },
            timeSpent: Number,
            accessTime: Date
        }],
        resourcesViewed: {
            pdfs: { type: Number, default: 0 },
            videos: { type: Number, default: 0 },
            links: { type: Number, default: 0 },
            notes: { type: Number, default: 0 }
        },
        achievementsEarned: [{
            achievementId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Achievement'
            },
            earnedAt: Date
        }],
        loginTime: Date,
        logoutTime: Date,
        sessionDuration: Number // in minutes
    }],
    
    // Weekly Summaries
    weeklyStats: [{
        weekStart: Date,
        weekEnd: Date,
        totalStudyTime: Number,
        averageDailyTime: Number,
        coursesCompleted: Number,
        resourcesAdded: Number,
        achievementsEarned: Number,
        learningStreak: Number,
        mostActiveDay: String,
        topCategory: String
    }],
    
    // Monthly Summaries
    monthlyStats: [{
        month: Number, // 1-12
        year: Number,
        totalStudyTime: Number,
        coursesCompleted: Number,
        pathsCompleted: Number,
        resourcesAdded: Number,
        notesCreated: Number,
        achievementsEarned: Number,
        averageSessionTime: Number,
        totalSessions: Number,
        longestStreak: Number,
        topCategories: [String],
        productivityScore: Number // 0-100
    }],
    
    // Learning Patterns
    learningPatterns: {
        preferredTimeSlots: [{
            hour: Number, // 0-23
            frequency: Number,
            averageProductivity: Number
        }],
        preferredDays: [{
            day: String, // Monday, Tuesday, etc.
            frequency: Number,
            averageStudyTime: Number
        }],
        learningStyle: {
            visual: Number, // percentage preference
            auditory: Number,
            kinesthetic: Number,
            reading: Number
        },
        topicInterests: [{
            category: String,
            engagementLevel: Number, // 0-100
            timeSpent: Number,
            completionRate: Number
        }]
    },
    
    // Goal Tracking
    goals: [{
        type: {
            type: String,
            enum: ['daily_time', 'weekly_time', 'courses_per_month', 'skill_mastery', 'custom'],
            required: true
        },
        target: {
            type: Number,
            required: true
        },
        current: {
            type: Number,
            default: 0
        },
        deadline: Date,
        isActive: {
            type: Boolean,
            default: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        achievedAt: Date,
        description: String
    }],
    
    // Overall Statistics
    overallStats: {
        totalStudyTime: {
            type: Number,
            default: 0
        },
        totalCourses: {
            type: Number,
            default: 0
        },
        completedCourses: {
            type: Number,
            default: 0
        },
        totalPaths: {
            type: Number,
            default: 0
        },
        completedPaths: {
            type: Number,
            default: 0
        },
        totalResources: {
            type: Number,
            default: 0
        },
        totalNotes: {
            type: Number,
            default: 0
        },
        totalAchievements: {
            type: Number,
            default: 0
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastActiveDate: Date,
        joinedDate: {
            type: Date,
            default: Date.now
        },
        level: {
            type: Number,
            default: 1
        },
        experiencePoints: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
progressAnalyticsSchema.index({ userId: 1 });
progressAnalyticsSchema.index({ 'dailyActivity.date': 1 });
progressAnalyticsSchema.index({ 'weeklyStats.weekStart': 1 });
progressAnalyticsSchema.index({ 'monthlyStats.year': 1, 'monthlyStats.month': 1 });

// Method to record daily activity
progressAnalyticsSchema.methods.recordDailyActivity = async function(activityData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyRecord = this.dailyActivity.find(
        activity => activity.date.getTime() === today.getTime()
    );
    
    if (!dailyRecord) {
        dailyRecord = {
            date: today,
            studyTime: 0,
            coursesAccessed: [],
            resourcesViewed: { pdfs: 0, videos: 0, links: 0, notes: 0 },
            achievementsEarned: []
        };
        this.dailyActivity.push(dailyRecord);
    }
    
    // Update daily record with new activity data
    Object.assign(dailyRecord, activityData);
    
    // Update overall stats
    this.overallStats.lastActiveDate = new Date();
    this.updateStreak();
    
    return this.save();
};

// Method to update learning streak
progressAnalyticsSchema.methods.updateStreak = function() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    const todayActivity = this.dailyActivity.find(
        activity => activity.date.getTime() === today.getTime()
    );
    
    const yesterdayActivity = this.dailyActivity.find(
        activity => activity.date.getTime() === yesterday.getTime()
    );
    
    if (todayActivity && todayActivity.studyTime > 0) {
        if (yesterdayActivity && yesterdayActivity.studyTime > 0) {
            this.overallStats.currentStreak += 1;
        } else {
            this.overallStats.currentStreak = 1;
        }
        
        if (this.overallStats.currentStreak > this.overallStats.longestStreak) {
            this.overallStats.longestStreak = this.overallStats.currentStreak;
        }
    } else {
        this.overallStats.currentStreak = 0;
    }
};

// Method to calculate weekly summary
progressAnalyticsSchema.methods.calculateWeeklySummary = function(weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekActivities = this.dailyActivity.filter(activity => 
        activity.date >= weekStart && activity.date <= weekEnd
    );
    
    const totalStudyTime = weekActivities.reduce((sum, activity) => sum + activity.studyTime, 0);
    const averageDailyTime = weekActivities.length > 0 ? totalStudyTime / weekActivities.length : 0;
    
    const coursesCompleted = weekActivities.reduce((sum, activity) => 
        sum + activity.coursesAccessed.length, 0
    );
    
    const achievementsEarned = weekActivities.reduce((sum, activity) => 
        sum + activity.achievementsEarned.length, 0
    );
    
    // Find most active day
    const dayActivities = {};
    weekActivities.forEach(activity => {
        const dayName = activity.date.toLocaleDateString('en-US', { weekday: 'long' });
        dayActivities[dayName] = (dayActivities[dayName] || 0) + activity.studyTime;
    });
    
    const mostActiveDay = Object.keys(dayActivities).reduce((a, b) => 
        dayActivities[a] > dayActivities[b] ? a : b, 'None'
    );
    
    return {
        weekStart,
        weekEnd,
        totalStudyTime,
        averageDailyTime: Math.round(averageDailyTime),
        coursesCompleted,
        achievementsEarned,
        mostActiveDay,
        resourcesAdded: 0, // This would be calculated from actual resource creation
        learningStreak: this.overallStats.currentStreak,
        topCategory: 'Programming' // This would be calculated from actual category engagement
    };
};

// Method to update experience points and level
progressAnalyticsSchema.methods.addExperiencePoints = function(points) {
    this.overallStats.experiencePoints += points;
    
    // Calculate level (100 XP per level)
    const newLevel = Math.floor(this.overallStats.experiencePoints / 100) + 1;
    
    if (newLevel > this.overallStats.level) {
        this.overallStats.level = newLevel;
        return { leveledUp: true, newLevel };
    }
    
    return { leveledUp: false, newLevel: this.overallStats.level };
};

// Static method to get user analytics
progressAnalyticsSchema.statics.getUserAnalytics = async function(userId, timeframe = '30days') {
    let analytics = await this.findOne({ userId });
    
    if (!analytics) {
        analytics = new this({ userId });
        await analytics.save();
    }
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
        case '7days':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30days':
            startDate.setDate(now.getDate() - 30);
            break;
        case '90days':
            startDate.setDate(now.getDate() - 90);
            break;
        case '1year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setDate(now.getDate() - 30);
    }
    
    const filteredActivities = analytics.dailyActivity.filter(
        activity => activity.date >= startDate
    );
    
    return {
        overallStats: analytics.overallStats,
        dailyActivity: filteredActivities,
        learningPatterns: analytics.learningPatterns,
        goals: analytics.goals.filter(goal => goal.isActive)
    };
};

// Static method to generate learning insights
progressAnalyticsSchema.statics.generateInsights = async function(userId) {
    const analytics = await this.findOne({ userId });
    if (!analytics) return [];
    
    const insights = [];
    const recentActivities = analytics.dailyActivity.slice(-30); // Last 30 days
    
    // Consistency insight
    const activeDays = recentActivities.filter(activity => activity.studyTime > 0).length;
    if (activeDays < 10) {
        insights.push({
            type: 'consistency',
            message: 'Try to study more consistently. Aim for at least 15 minutes daily.',
            priority: 'medium'
        });
    }
    
    // Productivity insight
    const totalTime = recentActivities.reduce((sum, activity) => sum + activity.studyTime, 0);
    const avgSessionTime = totalTime / Math.max(activeDays, 1);
    
    if (avgSessionTime < 25) {
        insights.push({
            type: 'productivity',
            message: 'Consider longer study sessions for better focus and retention.',
            priority: 'low'
        });
    }
    
    // Streak insight
    if (analytics.overallStats.currentStreak >= 7) {
        insights.push({
            type: 'achievement',
            message: `Great job! You're on a ${analytics.overallStats.currentStreak}-day streak!`,
            priority: 'high'
        });
    }
    
    return insights;
};

module.exports = mongoose.model('ProgressAnalytics', progressAnalyticsSchema);