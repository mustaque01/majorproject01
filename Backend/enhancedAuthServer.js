const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
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

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📞 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', { ...req.body, password: req.body.password ? '[REDACTED]' : undefined });
    }
    next();
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/learnpath-users', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('📦 Connected to MongoDB - learnpath-users database');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Enhanced User Schema with authorization features
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['student', 'instructor', 'admin'],
            message: 'Role must be either student, instructor, or admin'
        }
    },
    // Authorization permissions
    permissions: [{
        type: String,
        enum: ['read:courses', 'write:courses', 'read:users', 'write:users', 'admin:all']
    }],
    
    // Profile fields
    institution: {
        type: String,
        maxlength: [100, 'Institution name cannot exceed 100 characters']
    },
    department: {
        type: String,
        maxlength: [50, 'Department name cannot exceed 50 characters']
    },
    experience: {
        type: String,
        maxlength: [200, 'Experience description cannot exceed 200 characters']
    },
    specialization: {
        type: String,
        maxlength: [100, 'Specialization cannot exceed 100 characters']
    },
    
    // Security and status fields
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    
    // Security tokens
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
}, {
    timestamps: true
});

// Virtual for account lockout
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Method to handle failed login attempts
UserSchema.methods.incLoginAttempts = async function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }
    
    return this.updateOne(updates);
};

// Method to reset login attempts
UserSchema.methods.resetLoginAttempts = async function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Method to generate access token
UserSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { 
            id: this._id, 
            email: this.email, 
            role: this.role,
            permissions: this.permissions || []
        }, 
        process.env.JWT_ACCESS_SECRET || 'your-super-secret-jwt-access-key', 
        { expiresIn: '15m' }
    );
};

// Method to generate refresh token
UserSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        { id: this._id }, 
        process.env.JWT_REFRESH_SECRET || 'your-super-secret-jwt-refresh-key', 
        { expiresIn: '7d' }
    );
};

// Method to check permissions
UserSchema.methods.hasPermission = function(permission) {
    if (this.role === 'admin') return true; // Admin has all permissions
    return this.permissions && this.permissions.includes(permission);
};

const User = mongoose.model('User', UserSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your-super-secret-jwt-access-key');
        const user = await User.findById(decoded.id);
        
        if (!user || !user.isActive || user.isLocked) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or account locked/inactive.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('🔐 Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Authorization middleware
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// Permission-based authorization
const authorizePermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!req.user.hasPermission(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required permission: ${requiredPermission}`
            });
        }

        next();
    };
};

// REGISTRATION ENDPOINT
app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, institution, department, experience, specialization } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: firstName, lastName, email, password, role'
            });
        }

        // Validate role
        if (!['student', 'instructor'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role must be either student or instructor'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Set default permissions based on role
        let permissions = [];
        if (role === 'student') {
            permissions = ['read:courses'];
        } else if (role === 'instructor') {
            permissions = ['read:courses', 'write:courses'];
        }

        // Create user object
        const userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password,
            role,
            permissions
        };
        
        // Add role-specific fields
        if (role === 'student' && institution) {
            userData.institution = institution.trim();
        }
        
        if (role === 'instructor') {
            if (department) userData.department = department.trim();
            if (experience) userData.experience = experience.trim();
            if (specialization) userData.specialization = specialization.trim();
        }
        
        // Create user
        const user = new User(userData);
        await user.save();
        
        console.log('✅ User registered successfully:', user.email);
        
        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        // Save refresh token
        user.refreshTokens.push({ token: refreshToken });
        await user.save();
        
        // Prepare response (exclude sensitive data)
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            institution: user.institution,
            department: user.department,
            experience: user.experience,
            specialization: user.specialization,
            createdAt: user.createdAt
        };
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join('. ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// LOGIN ENDPOINT
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password, and role'
            });
        }
        
        // Find user by email and role (include password for comparison)
        const user = await User.findOne({ 
            email: email.toLowerCase(),
            role: role,
            isActive: true
        }).select('+password');
        
        // Check if user exists and account is not locked
        if (!user || user.isLocked) {
            return res.status(401).json({
                success: false,
                message: user && user.isLocked ? 'Account is temporarily locked. Try again later.' : 'Invalid credentials'
            });
        }
        
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            await user.incLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }
        
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        
        console.log('✅ User logged in successfully:', user.email);
        
        // Generate tokens
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        // Save refresh token
        user.refreshTokens.push({ token: refreshToken });
        await user.save();
        
        // Prepare response (exclude sensitive data)
        const userResponse = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            institution: user.institution,
            department: user.department,
            experience: user.experience,
            specialization: user.specialization,
            lastLoginAt: user.lastLoginAt
        };
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                accessToken,
                refreshToken
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

// REFRESH TOKEN ENDPOINT
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }
        
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-super-secret-jwt-refresh-key');
        
        // Find user and check if refresh token exists
        const user = await User.findById(decoded.id);
        if (!user || !user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
        
        // Generate new access token
        const newAccessToken = user.generateAccessToken();
        
        res.json({
            success: true,
            data: {
                accessToken: newAccessToken
            }
        });
        
    } catch (error) {
        console.error('❌ Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
});

// GET USER PROFILE (Protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const userResponse = {
            id: req.user._id,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role,
            permissions: req.user.permissions,
            isActive: req.user.isActive,
            isEmailVerified: req.user.isEmailVerified,
            institution: req.user.institution,
            department: req.user.department,
            experience: req.user.experience,
            specialization: req.user.specialization,
            lastLoginAt: req.user.lastLoginAt,
            createdAt: req.user.createdAt
        };
        
        res.json({
            success: true,
            data: {
                user: userResponse
            }
        });
        
    } catch (error) {
        console.error('❌ Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user profile'
        });
    }
});

// LOGOUT ENDPOINT (Protected)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (refreshToken) {
            // Remove the specific refresh token
            req.user.refreshTokens = req.user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
        } else {
            // Remove all refresh tokens (logout from all devices)
            req.user.refreshTokens = [];
        }
        
        await req.user.save();
        
        console.log('✅ User logged out:', req.user.email);
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout'
        });
    }
});

// ADMIN ONLY - Get All Users
app.get('/api/auth/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({ isActive: true }).select('-refreshTokens');
        
        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions,
                    institution: user.institution,
                    department: user.department,
                    isEmailVerified: user.isEmailVerified,
                    lastLoginAt: user.lastLoginAt,
                    createdAt: user.createdAt
                }))
            }
        });
        
    } catch (error) {
        console.error('❌ Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving users'
        });
    }
});

// INSTRUCTOR ONLY - Get Students in their courses
app.get('/api/auth/students', authenticateToken, authorizeRoles('instructor'), async (req, res) => {
    try {
        const students = await User.find({ 
            role: 'student', 
            isActive: true 
        }).select('firstName lastName email institution createdAt lastLoginAt');
        
        res.json({
            success: true,
            data: {
                students
            }
        });
        
    } catch (error) {
        console.error('❌ Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving students'
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LearnPath Enhanced Authentication API',
        status: 'Connected to MongoDB',
        features: [
            'JWT Authentication with Refresh Tokens',
            'Role-based Authorization',
            'Permission-based Access Control',
            'Rate Limiting',
            'Account Lockout Protection',
            'Security Headers'
        ],
        endpoints: [
            'POST /api/auth/register - Register new user',
            'POST /api/auth/login - Login user',
            'POST /api/auth/refresh - Refresh access token',
            'GET /api/auth/me - Get user profile (Protected)',
            'POST /api/auth/logout - Logout user (Protected)',
            'GET /api/auth/users - Get all users (Admin only)',
            'GET /api/auth/students - Get students (Instructor only)'
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Enhanced Auth Server running on port ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
    console.log(`🔐 Features: JWT + Refresh Tokens, RBAC, Permissions, Rate Limiting`);
    console.log(`📦 Database: learnpath-users`);
});

// expose authorizePermission for external use and avoid "assigned but never used"
app.authorizePermission = authorizePermission;

module.exports = app;