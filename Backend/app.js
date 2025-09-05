const express = require('express');
const mongoose = require('mongoose');
const categoriesRoutes = require('./Routes/categoriesDB');

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

mongoose.connect('mongodb://localhost:27017/learning-path-dashboard')
.then(() => {
    console.log('📦 Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Routes
app.use('/api/categories', categoriesRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Learning Path Dashboard API',
        version: '1.0.0',
        endpoints: [
            'GET /api/categories - Get all categories',
            'GET /api/categories/:id - Get category by ID',
            'GET /api/categories/:id/courses - Get courses by category',
            'GET /api/categories/courses/all - Get all courses',
            'GET /api/categories/courses/:id - Get course by ID',
            'GET /api/categories/stats/dashboard - Get dashboard statistics'
        ]
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📚 Learning Path Dashboard API`);
    console.log(`🔗 http://localhost:${PORT}`);
});