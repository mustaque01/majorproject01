const express = require('express');
const mongoose = require('mongoose');
const categoriesRoutes = require('./Routes/categoriesDB');
const authRoutes = require('./Routes/authReal');  // Use the real auth routes
const resourceRoutes = require('./Routes/resources');  // Resources routes
const { authenticateUser } = require('./middleware/authReal');  // Use real auth middleware

// Disable Mongoose buffering globally
mongoose.set('bufferCommands', false);

const app = express();
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📞 ${req.method} ${req.path} - Body:`, req.body);
    next();
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// MongoDB connection for production database with real users  
mongoose.connect('mongodb://localhost:27017/learnpath-production')
.then(() => {
    console.log('📦 Connected to MongoDB - Production Database');
    console.log('🔐 Real authentication system enabled');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit if can't connect to database
});

// Routes
console.log('🔍 Loading auth routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes loaded successfully');

console.log('🔍 Loading instructor routes...');
const instructorRoutes = require('./Routes/instructorsApi');
app.use('/api/instructors', instructorRoutes);
console.log('✅ Instructor routes loaded successfully');

console.log('🔍 Loading instructor course management routes...');
const instructorCoursesRoutes = require('./Routes/instructorCoursesApi');
app.use('/api/instructor-courses', instructorCoursesRoutes);
console.log('✅ Instructor course management routes loaded successfully');

console.log('🔍 Loading instructor dashboard routes...');
const instructorDashboardRoutes = require('./Routes/instructorDashboard');
app.use('/api/instructor', instructorDashboardRoutes);
console.log('✅ Instructor dashboard routes loaded successfully');

app.use('/api/categories', categoriesRoutes);
console.log('🔍 Loading resource routes...');
app.use('/api/resources', resourceRoutes);
console.log('✅ Resource routes loaded successfully');

// Achievement routes
const achievementRoutes = require('./routes/achievements');
app.use('/api/achievements', achievementRoutes);
console.log('✅ Achievement routes loaded successfully');

// Reward routes
console.log('🔍 Loading reward routes...');
const rewardRoutes = require('./Routes/rewards');
app.use('/api/rewards', rewardRoutes);
console.log('✅ Reward routes loaded successfully');

// Protected route example
app.get('/api/dashboard', authenticateUser, (req, res) => {
    res.json({
        success: true,
        message: `Welcome to your dashboard, ${req.user.firstName}!`,
        user: {
            id: req.user._id,
            name: req.user.fullName,
            role: req.user.role,
            email: req.user.email
        }
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Learning Path Dashboard API',
        version: '2.1.0',
        features: ['Authentication', 'Role-based Access', 'Student & Instructor Management', 'Course Management', 'Instructor Analytics', 'Dashboard'],
        endpoints: [
            // Authentication endpoints
            'POST /api/auth/register - Register new user (student/instructor)',
            'POST /api/auth/login - Login user',
            'POST /api/auth/logout - Logout user',
            'GET /api/auth/me - Get current user profile (requires auth)',
            'PUT /api/auth/me - Update user profile (requires auth)',
            'PUT /api/auth/change-password - Change password (requires auth)',
            'DELETE /api/auth/me - Deactivate account (requires auth)',
            // Instructor endpoints - Public
            'GET /api/instructors - Get all instructors with filtering',
            'GET /api/instructors/:id - Get instructor details',
            'GET /api/instructors/top/rated - Get top-rated instructors',
            'GET /api/instructors/:id/stats - Get instructor statistics',
            'GET /api/instructors/specialization/:spec - Get instructors by specialization',
            // Instructor endpoints - Protected
            'POST /api/instructors - Create new instructor (admin)',
            'PUT /api/instructors/:id - Update instructor (admin/self)',
            'DELETE /api/instructors/:id - Deactivate instructor (admin)',
            // Instructor Dashboard & Analytics (Protected - Instructor only)
            'GET /api/instructor/dashboard - Get complete instructor dashboard',
            'GET /api/instructor/performance-summary - Get performance metrics',
            'GET /api/instructor/earnings?period=monthly - Get earnings report',
            'GET /api/instructor/reviews - Get all course reviews',
            'GET /api/instructor/profile - Get instructor profile',
            'PUT /api/instructor/profile - Update instructor profile',
            'GET /api/instructor/courses - Get all my courses',
            'POST /api/instructor/courses - Create new course',
            'GET /api/instructor/courses/:courseId - Get course details',
            'PUT /api/instructor/courses/:courseId - Update course',
            'DELETE /api/instructor/courses/:courseId - Delete course',
            'POST /api/instructor/courses/:courseId/publish - Publish course',
            'POST /api/instructor/courses/:courseId/unpublish - Unpublish course',
            'GET /api/instructor/courses/:courseId/analytics - Get course analytics',
            'GET /api/instructor/courses/:courseId/stats - Get course statistics',
            // Legacy Instructor Course Management Routes
            'GET /api/instructor-courses/me/profile - Get current instructor profile',
            'PUT /api/instructor-courses/me/profile - Update instructor profile',
            'GET /api/instructor-courses/me/courses - List all my courses',
            'POST /api/instructor-courses/me/courses - Create new course',
            'GET /api/instructor-courses/me/courses/:id/stats - Get course statistics',
            'PUT /api/instructor-courses/me/courses/:id - Update course',
            'POST /api/instructor-courses/me/courses/:id/publish - Publish course',
            'POST /api/instructor-courses/me/courses/:id/unpublish - Unpublish course',
            'DELETE /api/instructor-courses/me/courses/:id - Delete course',
            // Category endpoints
            'GET /api/categories - Get all categories',
            'GET /api/categories/:id - Get category by ID',
            'GET /api/categories/:id/courses - Get courses by category',
            'GET /api/categories/courses/all - Get all courses',
            'GET /api/categories/courses/:id - Get course by ID',
            'GET /api/categories/stats/dashboard - Get dashboard statistics',
            // Achievement endpoints
            'GET /api/achievements - Get all achievements',
            'GET /api/achievements/:id - Get achievement by ID',
            'GET /api/achievements/user/me - Get user achievements (requires auth)',
            'POST /api/achievements - Create achievement (admin/instructor)',
            'PUT /api/achievements/:id - Update achievement (admin/instructor)',
            'DELETE /api/achievements/:id - Delete achievement (admin only)',
            'GET /api/achievements/leaderboard - Get achievement leaderboard',
            // Reward endpoints
            'GET /api/rewards/coins/stats - Get user coin statistics (requires auth)',
            'POST /api/rewards/daily-bonus - Claim daily login bonus (students only)',
            'POST /api/rewards/course-progress - Award coins for course progress (students only)',
            'GET /api/rewards/notifications - Get user notifications (requires auth)',
            'PUT /api/rewards/notifications/:id/read - Mark notification as read (requires auth)',
            'GET /api/rewards/leaderboard - Get coin leaderboard (requires auth)',
            // Dashboard
            'GET /api/dashboard - Get personalized dashboard (requires auth)'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 Learning Path Dashboard API v2.0`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`🔐 Authentication enabled`);
    console.log(`👥 Multi-role support: Students & Instructors`);
});

// Graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown(signal) {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
        console.log('🚪 HTTP server closed');
        
        mongoose.connection.close().then(() => {
            console.log('📦 MongoDB connection closed');
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
        }).catch((err) => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
        });
    });
    
    // Force close server after 10secs
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}