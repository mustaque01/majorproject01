const express = require('express');
const mongoose = require('mongoose');

// Import simplified models
const Student = require('../server/models/StudentSimple');
const Instructor = require('../server/models/InstructorSimple');

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
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Simple MongoDB connection
mongoose.connect('mongodb://localhost:27017/learning-path-simple')
.then(() => {
    console.log('📦 Connected to MongoDB (Simple Test)');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Simplified registration endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('🔍 Registration attempt:', req.body);
        const { role, ...userData } = req.body;
        
        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'password'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }
        
        let user;
        
        if (role === 'student') {
            console.log('🔍 Checking for existing student...');
            const existingStudent = await Student.findByEmail(userData.email);
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Student with this email already exists'
                });
            }
            
            console.log('🔍 Creating new student...');
            user = await Student.create(userData);
            console.log('✅ Student created successfully');
            
        } else if (role === 'instructor') {
            console.log('🔍 Checking for existing instructor...');
            const existingInstructor = await Instructor.findByEmail(userData.email);
            if (existingInstructor) {
                return res.status(400).json({
                    success: false,
                    message: 'Instructor with this email already exists'
                });
            }
            
            console.log('🔍 Creating new instructor...');
            user = await Instructor.create(userData);
            console.log('✅ Instructor created successfully');
            
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be either "student" or "instructor"'
            });
        }
        
        // Remove password from response
        user.password = undefined;
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Test endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Simple Registration Test Server',
        endpoints: [
            'POST /api/auth/register - Test registration'
        ]
    });
});

const PORT = 5001; // Different port to avoid conflicts

app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`🧪 Simple registration test`);
    console.log(`🔗 http://localhost:${PORT}`);
});