const express = require('express');
const categoriesRoutes = require('./Routes/categories');

const app = express();
app.use(express.json());

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