/**
 * ACHIEVEMENTS COMPONENT
 * Displays user achievements, progress, and available achievements to earn
 */

import React, { useState, useEffect } from 'react';

const Achievements = () => {
    const [userAchievements, setUserAchievements] = useState([]);
    const [allAchievements, setAllAchievements] = useState([]);
    const [userStats, setUserStats] = useState({});
    const [leaderboard, setLeaderboard] = useState([]);
    const [activeTab, setActiveTab] = useState('my-achievements');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ category: '', completed: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                setError('Please log in to view achievements');
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch user achievements and stats
            const userResponse = await fetch('http://localhost:5000/api/achievements/user/me', {
                headers
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                setUserAchievements(userData.data.achievements);
                setUserStats(userData.data.stats);
            }

            // Fetch all achievements
            const allResponse = await fetch('http://localhost:5000/api/achievements');
            if (allResponse.ok) {
                const allData = await allResponse.json();
                setAllAchievements(allData.data);
            }

            // Fetch leaderboard
            const leaderResponse = await fetch('http://localhost:5000/api/achievements/leaderboard');
            if (leaderResponse.ok) {
                const leaderData = await leaderResponse.json();
                setLeaderboard(leaderData.data);
            }

        } catch (err) {
            console.error('Error fetching achievements:', err);
            setError('Failed to load achievements');
        } finally {
            setLoading(false);
        }
    };

    const getRarityColor = (rarity) => {
        const colors = {
            common: 'text-gray-500 bg-gray-100',
            uncommon: 'text-green-600 bg-green-100',
            rare: 'text-blue-600 bg-blue-100',
            epic: 'text-purple-600 bg-purple-100',
            legendary: 'text-yellow-600 bg-yellow-100'
        };
        return colors[rarity] || colors.common;
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: 'text-green-600',
            medium: 'text-yellow-600',
            hard: 'text-orange-600',
            expert: 'text-red-600'
        };
        return colors[difficulty] || colors.easy;
    };

    const getProgressPercentage = (current, target) => {
        return Math.min((current / target) * 100, 100);
    };

    const filteredUserAchievements = userAchievements.filter(ua => {
        if (filter.completed === 'true' && !ua.isCompleted) return false;
        if (filter.completed === 'false' && ua.isCompleted) return false;
        if (filter.category && ua.achievementId?.category !== filter.category) return false;
        return true;
    });

    const filteredAllAchievements = allAchievements.filter(achievement => {
        if (filter.category && achievement.category !== filter.category) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading achievements...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
                    <button
                        onClick={fetchData}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
                    <p className="text-gray-600">Track your progress and unlock new badges</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-2xl font-bold text-blue-600">{userStats.completed || 0}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-2xl font-bold text-green-600">{userStats.inProgress || 0}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-2xl font-bold text-purple-600">{userStats.completionRate || 0}%</div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-2xl font-bold text-yellow-600">{userStats.totalPoints || 0}</div>
                        <div className="text-sm text-gray-600">Total Points</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('my-achievements')}
                            className={`px-6 py-3 font-medium ${
                                activeTab === 'my-achievements'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            My Achievements
                        </button>
                        <button
                            onClick={() => setActiveTab('all-achievements')}
                            className={`px-6 py-3 font-medium ${
                                activeTab === 'all-achievements'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All Achievements
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`px-6 py-3 font-medium ${
                                activeTab === 'leaderboard'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Leaderboard
                        </button>
                    </div>

                    {/* Filters */}
                    {(activeTab === 'my-achievements' || activeTab === 'all-achievements') && (
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex flex-wrap gap-4">
                                <select
                                    value={filter.category}
                                    onChange={(e) => setFilter({...filter, category: e.target.value})}
                                    className="border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">All Categories</option>
                                    <option value="learning">Learning</option>
                                    <option value="completion">Completion</option>
                                    <option value="streak">Streak</option>
                                    <option value="social">Social</option>
                                    <option value="milestone">Milestone</option>
                                    <option value="skill">Skill</option>
                                </select>

                                {activeTab === 'my-achievements' && (
                                    <select
                                        value={filter.completed}
                                        onChange={(e) => setFilter({...filter, completed: e.target.value})}
                                        className="border border-gray-300 rounded-lg px-3 py-2"
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Completed</option>
                                        <option value="false">In Progress</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'my-achievements' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredUserAchievements.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        No achievements found
                                    </div>
                                ) : (
                                    filteredUserAchievements.map((ua) => (
                                        <div key={ua._id} className={`bg-gray-50 p-4 rounded-lg border-l-4 ${
                                            ua.isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-300'
                                        }`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <i className={`${ua.achievementId?.icon || 'fas fa-trophy'} text-lg ${
                                                        ua.isCompleted ? 'text-green-600' : 'text-gray-400'
                                                    }`}></i>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                        getRarityColor(ua.achievementId?.badge?.rarity)
                                                    }`}>
                                                        {ua.achievementId?.badge?.rarity || 'common'}
                                                    </span>
                                                </div>
                                                {ua.isCompleted && (
                                                    <i className="fas fa-check-circle text-green-500"></i>
                                                )}
                                            </div>
                                            
                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                {ua.achievementId?.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {ua.achievementId?.description}
                                            </p>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span>{ua.currentProgress} / {ua.achievementId?.criteria?.target}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${
                                                            ua.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}
                                                        style={{
                                                            width: `${getProgressPercentage(
                                                                ua.currentProgress,
                                                                ua.achievementId?.criteria?.target
                                                            )}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                {ua.completedAt && (
                                                    <div className="text-xs text-gray-500">
                                                        Completed: {new Date(ua.completedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-3 flex justify-between items-center">
                                                <span className={`text-sm font-medium ${
                                                    getDifficultyColor(ua.achievementId?.difficulty)
                                                }`}>
                                                    {ua.achievementId?.difficulty}
                                                </span>
                                                <span className="text-sm font-bold text-yellow-600">
                                                    {ua.achievementId?.points} pts
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'all-achievements' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredAllAchievements.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        No achievements found
                                    </div>
                                ) : (
                                    filteredAllAchievements.map((achievement) => {
                                        const userAchievement = userAchievements.find(
                                            ua => ua.achievementId?._id === achievement._id
                                        );
                                        
                                        return (
                                            <div key={achievement._id} className={`bg-gray-50 p-4 rounded-lg border-l-4 ${
                                                userAchievement?.isCompleted ? 'border-green-500' : 'border-gray-300'
                                            }`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <i className={`${achievement.icon} text-lg ${
                                                            userAchievement?.isCompleted ? 'text-green-600' : 'text-gray-400'
                                                        }`}></i>
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            getRarityColor(achievement.badge?.rarity)
                                                        }`}>
                                                            {achievement.badge?.rarity}
                                                        </span>
                                                    </div>
                                                    {userAchievement?.isCompleted && (
                                                        <i className="fas fa-check-circle text-green-500"></i>
                                                    )}
                                                </div>
                                                
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {achievement.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    {achievement.description}
                                                </p>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Target</span>
                                                        <span>{achievement.criteria?.target} {achievement.criteria?.type}</span>
                                                    </div>
                                                    {userAchievement && (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span>Your Progress</span>
                                                                <span>{userAchievement.currentProgress} / {achievement.criteria?.target}</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${
                                                                        userAchievement.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                                                    }`}
                                                                    style={{
                                                                        width: `${getProgressPercentage(
                                                                            userAchievement.currentProgress,
                                                                            achievement.criteria?.target
                                                                        )}%`
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-3 flex justify-between items-center">
                                                    <span className={`text-sm font-medium ${
                                                        getDifficultyColor(achievement.difficulty)
                                                    }`}>
                                                        {achievement.difficulty}
                                                    </span>
                                                    <span className="text-sm font-bold text-yellow-600">
                                                        {achievement.points} pts
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'leaderboard' && (
                            <div className="space-y-4">
                                {leaderboard.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No leaderboard data available
                                    </div>
                                ) : (
                                    leaderboard.map((entry, index) => (
                                        <div key={entry.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                                                    index === 0 ? 'bg-yellow-500' :
                                                    index === 1 ? 'bg-gray-400' :
                                                    index === 2 ? 'bg-orange-400' : 'bg-gray-600'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {entry.username}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {entry.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-blue-600">
                                                    {entry.completedCount} achievements
                                                </div>
                                                {entry.lastCompleted && (
                                                    <div className="text-sm text-gray-500">
                                                        Last: {new Date(entry.lastCompleted).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Achievements;