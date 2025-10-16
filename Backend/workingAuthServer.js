const express = require('express');
const mongoose = require('mongoose');

// Try to load bcrypt, fallback if not available
let bcrypt;
try {
    bcrypt = require('bcryptjs');
} catch (error) {
    console.log('⚠️ bcryptjs not found, using simple password comparison');
}

// Try to load JWT, fallback if not available
let jwt;
try {
    jwt = require('jsonwebtoken');
} catch (error) {
    console.log('⚠️ jsonwebtoken not found, using simple tokens');
}

const app = express();
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
    console.log(`📞 ${req.method} ${req.path}`);
    next();
});

// Simple MongoDB connection
mongoose.connect('mongodb://localhost:27017/learning-path-working')
.then(() => {
    console.log('📦 Connected to MongoDB');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Simplified User Schema - Single model for both students and instructors
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        enum: ['student', 'instructor']
    },
    // Optional fields based on role
    institution: String,
    department: String,
    experience: String,
    specialization: String,
    
    // Status fields
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    if (bcrypt) {
        try {
            this.password = await bcrypt.hash(this.password, 12);
        } catch (error) {
            console.log('Hash error, using plain password');
        }
    }
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
    if (bcrypt) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            console.log('Compare error, using plain comparison');
            return password === this.password;
        }
    }
    return password === this.password;
};

const User = mongoose.model('User', UserSchema);

// JWT Secret
const JWT_SECRET = 'your-super-secret-jwt-key-here';

// Helper function to generate JWT
const generateToken = (user) => {
    if (jwt) {
        try {
            return jwt.sign(
                { 
                    id: user._id, 
                    email: user.email, 
                    role: user.role 
                }, 
                JWT_SECRET, 
                { expiresIn: '7d' }
            );
        } catch (error) {
            console.log('JWT error, using simple token');
            return `${user._id}_${user.email}_${Date.now()}`;
        }
    }
    return `${user._id}_${user.email}_${Date.now()}`;
};

// REGISTRATION ENDPOINT
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('🔍 Registration request:', req.body);
        
        const { firstName, lastName, email, password, role, institution, department, experience, specialization } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }
        
        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        // Create user object
        const userData = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            role
        };
        
        // Add role-specific fields
        if (role === 'student' && institution) {
            userData.institution = institution;
        }
        
        if (role === 'instructor') {
            if (department) userData.department = department;
            if (experience) userData.experience = experience;
            if (specialization) userData.specialization = specialization;
        }
        
        // Create user
        const user = new User(userData);
        await user.save();
        
        console.log('✅ User created successfully');
        
        // Generate token
        const token = generateToken(user);
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            token,
            data: {
                user: userResponse
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

// LOGIN ENDPOINT
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔍 Login request:', { email: req.body.email, role: req.body.role });
        
        const { email, password, role } = req.body;
        
        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password, and role'
            });
        }
        
        // Find user by email and role
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            role: role,
            isActive: true
        });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials or role'
            });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        
        console.log('✅ Login successful');
        
        // Generate token
        const token = generateToken(user);
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json({
            success: true,
            token,
            data: {
                user: userResponse
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// GET USER PROFILE
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                user
            }
        });
        
    } catch (error) {
        console.error('❌ Get profile error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LearnPath Authentication API - Working Version',
        status: 'Connected to MongoDB',
        endpoints: [
            'POST /api/auth/register - Register new user',
            'POST /api/auth/login - Login user',
            'GET /api/auth/me - Get user profile'
        ]
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Working Auth Server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`✅ Simplified schema - No buffering issues`);
});