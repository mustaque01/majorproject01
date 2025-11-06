/**
 * REWARD SYSTEM SERVICE
 * Handles coin rewards for course completion and progress
 */

const User = require('../models/UserReal');
const { UserAchievement } = require('../models/Achievement');

// Reward constants
const REWARD_RATES = {
    COURSE_COMPLETION: 100,     // Coins for completing a course (100%)
    COURSE_PROGRESS: {
        25: 10,   // 25% progress = 10 coins
        50: 25,   // 50% progress = 25 coins  
        75: 40,   // 75% progress = 40 coins
        100: 100  // 100% completion = 100 coins total
    },
    DAILY_LOGIN: 5,             // Daily login bonus
    ACHIEVEMENT: 50,            // Achievement completion bonus
    STREAK_MULTIPLIER: 1.5      // Multiplier for consecutive progress
};

/**
 * Award coins for course progress milestones
 * @param {ObjectId} userId - User ID
 * @param {ObjectId} courseId - Course ID
 * @param {Number} oldProgress - Previous progress percentage
 * @param {Number} newProgress - New progress percentage
 * @param {String} courseTitle - Course title for notifications
 */
const awardProgressCoins = async (userId, courseId, oldProgress, newProgress, courseTitle) => {
    try {
        console.log(`🪙 Checking progress rewards for user ${userId}`);
        console.log(`📊 Progress: ${oldProgress}% → ${newProgress}%`);

        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ User not found for reward');
            return null;
        }

        let totalCoinsAwarded = 0;
        const milestones = [25, 50, 75, 100];
        
        // Check each milestone
        for (const milestone of milestones) {
            if (oldProgress < milestone && newProgress >= milestone) {
                const coins = REWARD_RATES.COURSE_PROGRESS[milestone];
                
                await user.awardCoins(
                    coins,
                    'course_progress',
                    `${milestone}% progress on ${courseTitle}`,
                    courseId
                );

                // Add notification
                await user.addNotification(
                    'reward',
                    '🎉 Progress Reward!',
                    `You earned ${coins} coins for reaching ${milestone}% progress in "${courseTitle}"!`,
                    coins,
                    { 
                        courseId,
                        progressPercentage: milestone
                    }
                );

                totalCoinsAwarded += coins;
                console.log(`✅ Awarded ${coins} coins for ${milestone}% milestone`);

                // Update achievements for courses_completed if 100%
                if (milestone === 100) {
                    await UserAchievement.updateUserProgress(userId, 'courses_completed', 1);
                }
            }
        }

        if (totalCoinsAwarded > 0) {
            console.log(`🪙 Total coins awarded: ${totalCoinsAwarded}`);
            
            return {
                success: true,
                coinsAwarded: totalCoinsAwarded,
                newBalance: user.coins,
                milestones: milestones.filter(m => oldProgress < m && newProgress >= m)
            };
        }

        return { success: true, coinsAwarded: 0 };

    } catch (error) {
        console.error('💥 Error awarding progress coins:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Award daily login bonus
 * @param {ObjectId} userId - User ID
 */
const awardDailyLoginBonus = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if user already got daily bonus today
        const todayTransaction = user.coinTransactions.find(t => 
            t.source === 'daily_login' && 
            t.timestamp >= today
        );

        if (todayTransaction) {
            return { success: true, alreadyAwarded: true };
        }

        const dailyCoins = REWARD_RATES.DAILY_LOGIN;
        
        await user.awardCoins(
            dailyCoins,
            'daily_login',
            'Daily login bonus'
        );

        await user.addNotification(
            'reward',
            '🌟 Daily Bonus!',
            `Welcome back! You earned ${dailyCoins} coins for logging in today.`,
            dailyCoins
        );

        console.log(`🪙 Daily login bonus awarded: ${dailyCoins} coins`);

        return {
            success: true,
            coinsAwarded: dailyCoins,
            newBalance: user.coins
        };

    } catch (error) {
        console.error('💥 Error awarding daily bonus:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Award achievement completion bonus
 * @param {ObjectId} userId - User ID
 * @param {String} achievementTitle - Achievement title
 * @param {ObjectId} achievementId - Achievement ID
 */
const awardAchievementBonus = async (userId, achievementTitle, achievementId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const achievementCoins = REWARD_RATES.ACHIEVEMENT;
        
        await user.awardCoins(
            achievementCoins,
            'achievement',
            `Achievement unlocked: ${achievementTitle}`,
            achievementId
        );

        await user.addNotification(
            'achievement',
            '🏆 Achievement Unlocked!',
            `Congratulations! You earned ${achievementCoins} coins for "${achievementTitle}"`,
            achievementCoins,
            { achievementId }
        );

        console.log(`🪙 Achievement bonus awarded: ${achievementCoins} coins`);

        return {
            success: true,
            coinsAwarded: achievementCoins,
            newBalance: user.coins
        };

    } catch (error) {
        console.error('💥 Error awarding achievement bonus:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get user's coin statistics
 * @param {ObjectId} userId - User ID
 */
const getUserCoinStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - 7);

        const thisMonth = new Date(today);
        thisMonth.setMonth(today.getMonth() - 1);

        const todayTransactions = user.coinTransactions.filter(t => t.timestamp >= today);
        const weekTransactions = user.coinTransactions.filter(t => t.timestamp >= thisWeek);
        const monthTransactions = user.coinTransactions.filter(t => t.timestamp >= thisMonth);

        const todayEarned = todayTransactions
            .filter(t => t.type === 'earned')
            .reduce((sum, t) => sum + t.amount, 0);

        const weekEarned = weekTransactions
            .filter(t => t.type === 'earned')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthEarned = monthTransactions
            .filter(t => t.type === 'earned')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            currentBalance: user.coins,
            totalEarned: user.totalCoinsEarned,
            todayEarned,
            weekEarned,
            monthEarned,
            recentTransactions: user.coinTransactions
                .slice(-10)
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        };

    } catch (error) {
        console.error('💥 Error getting coin stats:', error);
        return null;
    }
};

module.exports = {
    awardProgressCoins,
    awardDailyLoginBonus,
    awardAchievementBonus,
    getUserCoinStats,
    REWARD_RATES
};