/**
 * MY LEARNING PATHS COMPONENT
 * Displays user's enrolled learning paths and available paths to join
 */

import React, { useState, useEffect } from 'react';

const MyLearningPaths = () => {
    const [enrolledPaths, setEnrolledPaths] = useState([]);
    const [availablePaths, setAvailablePaths] = useState([]);
    const [activeTab, setActiveTab] = useState('enrolled');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            
            if (!token) {
                setError('Please log in to view learning paths');
                return;
            }

            // For now, show placeholder data since we haven't implemented the LearningPath routes yet
            // TODO: Replace with actual API calls when LearningPath controller is implemented
            
            // Simulate enrolled paths
            setEnrolledPaths([
                {
                    _id: '1',
                    title: 'Full Stack Web Development',
                    description: 'Complete path from frontend to backend development',
                    courses: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
                    progress: 65,
                    enrolledAt: new Date('2024-01-15'),
                    lastActivity: new Date('2024-11-05'),
                    difficulty: 'intermediate',
                    estimatedHours: 120
                },
                {
                    _id: '2',
                    title: 'Data Science Fundamentals',
                    description: 'Learn Python, statistics, and machine learning basics',
                    courses: ['Python Basics', 'Statistics', 'Pandas', 'Matplotlib', 'Scikit-learn'],
                    progress: 30,
                    enrolledAt: new Date('2024-10-01'),
                    lastActivity: new Date('2024-11-03'),
                    difficulty: 'beginner',
                    estimatedHours: 80
                }
            ]);

            // Simulate available paths
            setAvailablePaths([
                {
                    _id: '3',
                    title: 'Mobile App Development',
                    description: 'Build iOS and Android apps with React Native',
                    courses: ['React Native', 'Mobile UI/UX', 'App Store Deployment'],
                    difficulty: 'intermediate',
                    estimatedHours: 90,
                    enrolledUsers: 245,
                    rating: 4.8
                },
                {
                    _id: '4',
                    title: 'DevOps Essentials',
                    description: 'Learn Docker, Kubernetes, and CI/CD pipelines',
                    courses: ['Docker', 'Kubernetes', 'CI/CD', 'AWS Basics'],
                    difficulty: 'advanced',
                    estimatedHours: 100,
                    enrolledUsers: 189,
                    rating: 4.6
                }
            ]);

        } catch (err) {
            console.error('Error fetching learning paths:', err);
            setError('Failed to load learning paths');
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            beginner: 'text-green-600 bg-green-100',
            intermediate: 'text-yellow-600 bg-yellow-100',
            advanced: 'text-red-600 bg-red-100'
        };
        return colors[difficulty] || colors.beginner;
    };

    const getProgressColor = (progress) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const handleEnroll = async (pathId) => {
        try {
            // TODO: Implement actual enrollment API call
            console.log('Enrolling in path:', pathId);
            // For now, just show a success message
            alert('Enrollment functionality will be implemented with the LearningPath API');
        } catch (err) {
            console.error('Error enrolling in path:', err);
            alert('Failed to enroll in learning path');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading learning paths...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Paths</h1>
                    <p className="text-gray-600">Track your learning journey and discover new paths</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('enrolled')}
                            className={`px-6 py-3 font-medium ${
                                activeTab === 'enrolled'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Enrolled Paths ({enrolledPaths.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('available')}
                            className={`px-6 py-3 font-medium ${
                                activeTab === 'available'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Available Paths ({availablePaths.length})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {activeTab === 'enrolled' && (
                            <div className="space-y-6">
                                {enrolledPaths.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-500 mb-4">
                                            <i className="fas fa-route text-6xl"></i>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No enrolled paths yet
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Start your learning journey by enrolling in a path
                                        </p>
                                        <button
                                            onClick={() => setActiveTab('available')}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            Browse Available Paths
                                        </button>
                                    </div>
                                ) : (
                                    enrolledPaths.map((path) => (
                                        <div key={path._id} className="bg-white border border-gray-200 rounded-lg p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                        {path.title}
                                                    </h3>
                                                    <p className="text-gray-600 mb-3">{path.description}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span className={`px-2 py-1 rounded-full ${getDifficultyColor(path.difficulty)}`}>
                                                            {path.difficulty}
                                                        </span>
                                                        <span>
                                                            <i className="fas fa-clock mr-1"></i>
                                                            {path.estimatedHours} hours
                                                        </span>
                                                        <span>
                                                            <i className="fas fa-book mr-1"></i>
                                                            {path.courses.length} courses
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-2xl font-bold text-blue-600">{path.progress}%</div>
                                                    <div className="text-sm text-gray-500">Complete</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                    <span>Progress</span>
                                                    <span>{path.progress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full ${getProgressColor(path.progress)}`}
                                                        style={{ width: `${path.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Course List */}
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 mb-2">Courses in this path:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {path.courses.map((course, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                                        >
                                                            {course}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Path Info */}
                                            <div className="flex justify-between items-center text-sm text-gray-500">
                                                <div>
                                                    Enrolled: {path.enrolledAt?.toLocaleDateString()}
                                                </div>
                                                <div>
                                                    Last activity: {path.lastActivity?.toLocaleDateString()}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                                    Continue Learning
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'available' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {availablePaths.length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-gray-500">
                                        No available paths found
                                    </div>
                                ) : (
                                    availablePaths.map((path) => (
                                        <div key={path._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                    {path.title}
                                                </h3>
                                                <p className="text-gray-600 mb-3">{path.description}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                                    <span className={`px-2 py-1 rounded-full ${getDifficultyColor(path.difficulty)}`}>
                                                        {path.difficulty}
                                                    </span>
                                                    <span>
                                                        <i className="fas fa-clock mr-1"></i>
                                                        {path.estimatedHours} hours
                                                    </span>
                                                    <span>
                                                        <i className="fas fa-book mr-1"></i>
                                                        {path.courses.length} courses
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Course List */}
                                            <div className="mb-4">
                                                <h4 className="font-medium text-gray-900 mb-2">What you'll learn:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {path.courses.map((course, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                                        >
                                                            {course}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                                                <div className="flex items-center">
                                                    <i className="fas fa-users mr-1"></i>
                                                    {path.enrolledUsers} enrolled
                                                </div>
                                                <div className="flex items-center">
                                                    <i className="fas fa-star mr-1 text-yellow-500"></i>
                                                    {path.rating}/5
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => handleEnroll(path._id)}
                                                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Enroll Now
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Note about implementation */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <div className="flex items-start">
                        <i className="fas fa-info-circle text-yellow-600 mr-2 mt-1"></i>
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-1">Coming Soon</h4>
                            <p className="text-yellow-700 text-sm">
                                This page currently shows sample data. Full learning path functionality will be available 
                                once the LearningPath backend API is implemented.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyLearningPaths;