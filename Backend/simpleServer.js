const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Basic middleware
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Request logging
app.use((req, res, next) => {
    console.log(`📞 ${req.method} ${req.path} - Body:`, req.body);
    next();
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/learning-path-dashboard')
.then(() => {
    console.log('📦 Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Simple test registration route
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('🔍 Registration attempt:', req.body);
        
        const { firstName, lastName, email, password, role } = req.body;
        
        // Basic validation
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // For now, just return success
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    firstName,
                    lastName,
                    email,
                    role
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Test route
app.get('/api/auth/test', (req, res) => {
    console.log('🔍 Test route accessed');
    res.json({ success: true, message: 'Auth routes are working!' });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Learning Path Dashboard API - Simple Test',
        version: '1.0.0',
        endpoints: [
            'GET /api/auth/test - Test auth endpoints',
            'POST /api/auth/register - Register new user'
        ]
    });
});

// Error handling
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
    console.log(`🚀 Simple test server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
});