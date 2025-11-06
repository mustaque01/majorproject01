/**
 * PROGRESS ANALYTICS COMPONENT
 * Shows user learning analytics, streaks, insights, and progress charts
 */

import React, { useState, useEffect } from 'react';

const ProgressAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                setError('Please log in to view analytics');
                return;
            }

            // For now, show placeholder data since we haven't implemented the ProgressAnalytics routes yet
            // TODO: Replace with actual API calls when ProgressAnalytics controller is implemented
            
            // Simulate analytics data
            setAnalytics({
                currentStreak: 7,
                longestStreak: 15,
                totalStudyHours: 45.5,
                activeDays: 23,
                experiencePoints: 1250,
                level: 8,
                weeklyGoal: 10,
                weeklyProgress: 7.5,
                
                // Daily activity for the last 30 days
                dailyActivity: Array.from({ length: 30 }, (_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
                    studyTime: Math.random() * 3, // 0-3 hours
                    coursesCompleted: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
                    resourcesViewed: Math.floor(Math.random() * 5),
                    active: Math.random() > 0.3
                })),
                
                // Weekly summary
                weeklySummary: [
                    { week: 'Week 1', studyHours: 8.5, coursesCompleted: 2 },
                    { week: 'Week 2', studyHours: 12.0, coursesCompleted: 3 },
                    { week: 'Week 3', studyHours: 15.5, coursesCompleted: 4 },
                    { week: 'Week 4', studyHours: 9.5, coursesCompleted: 2 }
                ],
                
                // Subject breakdown
                subjectBreakdown: [
                    { subject: 'JavaScript', hours: 15.2, percentage: 33 },
                    { subject: 'React', hours: 12.8, percentage: 28 },
                    { subject: 'Node.js', hours: 8.5, percentage: 19 },
                    { subject: 'CSS', hours: 6.0, percentage: 13 },
                    { subject: 'Other', hours: 3.0, percentage: 7 }
                ],
                
                insights: [
                    {
                        type: 'streak',
                        title: 'Great streak!',
                        message: 'You\'ve been consistent for 7 days. Keep it up!',
                        icon: 'fas fa-fire',
                        color: 'text-orange-500'
                    },
                    {
                        type: 'peak',
                        title: 'Peak performance',
                        message: 'You study best between 2-4 PM. Most courses completed during this time.',
                        icon: 'fas fa-chart-line',
                        color: 'text-blue-500'
                    },
                    {
                        type: 'recommendation',
                        title: 'Try something new',
                        message: 'Based on your JavaScript progress, you might enjoy learning TypeScript.',
                        icon: 'fas fa-lightbulb',
                        color: 'text-yellow-500'
                    }
                ]
            });

        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const getActivityColor = (studyTime) => {
        if (studyTime === 0) return 'bg-gray-100';
        if (studyTime < 0.5) return 'bg-green-100';
        if (studyTime < 1) return 'bg-green-200';
        if (studyTime < 2) return 'bg-green-400';
        return 'bg-green-600';
    };

    const getActivityTooltip = (day) => {
        if (!day.active) return 'No activity';
        return `${day.studyTime.toFixed(1)}h study time, ${day.coursesCompleted} courses completed`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
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
                        onClick={fetchAnalytics}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Analytics</h1>
                            <p className="text-gray-600">Track your learning progress and discover insights</p>
                        </div>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                                <p className="text-2xl font-bold text-orange-600">{analytics.currentStreak} days</p>
                            </div>
                            <div className="text-orange-500">
                                <i className="fas fa-fire text-2xl"></i>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            Longest: {analytics.longestStreak} days
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Study Hours</p>
                                <p className="text-2xl font-bold text-blue-600">{analytics.totalStudyHours}h</p>
                            </div>
                            <div className="text-blue-500">
                                <i className="fas fa-clock text-2xl"></i>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            Last {timeRange} days
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Experience Points</p>
                                <p className="text-2xl font-bold text-purple-600">{analytics.experiencePoints} XP</p>
                            </div>
                            <div className="text-purple-500">
                                <i className="fas fa-star text-2xl"></i>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            Level {analytics.level}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Days</p>
                                <p className="text-2xl font-bold text-green-600">{analytics.activeDays}</p>
                            </div>
                            <div className="text-green-500">
                                <i className="fas fa-calendar-check text-2xl"></i>
                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            Out of {timeRange} days
                        </div>
                    </div>
                </div>

                {/* Weekly Goal Progress */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Goal Progress</h3>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                            {analytics.weeklyProgress}h / {analytics.weeklyGoal}h this week
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                            {Math.round((analytics.weeklyProgress / analytics.weeklyGoal) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-blue-500 h-4 rounded-full"
                            style={{ width: `${Math.min((analytics.weeklyProgress / analytics.weeklyGoal) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Activity Heatmap */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
                        <div className="grid grid-cols-7 gap-1">
                            {analytics.dailyActivity.slice(-28).map((day, index) => (
                                <div
                                    key={index}
                                    className={`w-8 h-8 rounded ${getActivityColor(day.studyTime)} cursor-pointer`}
                                    title={getActivityTooltip(day)}
                                ></div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                            <span>Less</span>
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                                <div className="w-3 h-3 bg-green-100 rounded"></div>
                                <div className="w-3 h-3 bg-green-200 rounded"></div>
                                <div className="w-3 h-3 bg-green-400 rounded"></div>
                                <div className="w-3 h-3 bg-green-600 rounded"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>

                    {/* Subject Breakdown */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Time by Subject</h3>
                        <div className="space-y-3">
                            {analytics.subjectBreakdown.map((subject, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center flex-1">
                                        <span className="text-sm font-medium text-gray-700 w-20">
                                            {subject.subject}
                                        </span>
                                        <div className="flex-1 mx-3">
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className="bg-blue-500 h-3 rounded-full"
                                                    style={{ width: `${subject.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-12 text-right">
                                            {subject.hours}h
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Weekly Summary Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {analytics.weeklySummary.map((week, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-blue-100 rounded-lg p-4 mb-2">
                                    <div className="text-2xl font-bold text-blue-600">{week.studyHours}h</div>
                                    <div className="text-sm text-gray-600">{week.coursesCompleted} courses</div>
                                </div>
                                <div className="text-sm font-medium text-gray-700">{week.week}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Insights */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
                    <div className="space-y-4">
                        {analytics.insights.map((insight, index) => (
                            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <div className={`${insight.color} mt-1`}>
                                    <i className={`${insight.icon} text-lg`}></i>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                    <p className="text-gray-600 text-sm">{insight.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Note about implementation */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
                    <div className="flex items-start">
                        <i className="fas fa-info-circle text-yellow-600 mr-2 mt-1"></i>
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-1">Coming Soon</h4>
                            <p className="text-yellow-700 text-sm">
                                This page currently shows sample data. Full analytics functionality will be available 
                                once the ProgressAnalytics backend API is implemented.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressAnalytics;