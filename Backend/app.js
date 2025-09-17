const express = require('express');
const mongoose = require('mongoose');
const categoriesRoutes = require('./Routes/categoriesDB');
const authRoutes = require('../server/routes/auth');
const { protect } = require('../server/middleware/auth');

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

mongoose.connect('mongodb://localhost:27017/learning-path-dashboard')
.then(() => {
    console.log('📦 Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Routes
console.log('🔍 Loading auth routes...');
app.use('/api/auth', authRoutes);
console.log('✅ Auth routes loaded successfully');
app.use('/api/categories', categoriesRoutes);

// Protected route example
app.get('/api/dashboard', protect, (req, res) => {
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
        version: '2.0.0',
        features: ['Authentication', 'Role-based Access', 'Student & Instructor Management'],
        endpoints: [
            // Authentication endpoints
            'POST /api/auth/register - Register new user (student/instructor)',
            'POST /api/auth/login - Login user',
            'POST /api/auth/logout - Logout user',
            'GET /api/auth/me - Get current user profile (requires auth)',
            'PUT /api/auth/me - Update user profile (requires auth)',
            'PUT /api/auth/change-password - Change password (requires auth)',
            'DELETE /api/auth/me - Deactivate account (requires auth)',
            // Category endpoints
            'GET /api/categories - Get all categories',
            'GET /api/categories/:id - Get category by ID',
            'GET /api/categories/:id/courses - Get courses by category',
            'GET /api/categories/courses/all - Get all courses',
            'GET /api/categories/courses/:id - Get course by ID',
            'GET /api/categories/stats/dashboard - Get dashboard statistics',
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

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 Learning Path Dashboard API v2.0`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`🔐 Authentication enabled`);
    console.log(`👥 Multi-role support: Students & Instructors`);
});