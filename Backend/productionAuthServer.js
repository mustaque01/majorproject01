/**
 * REAL PRODUCTION AUTHENTICATION SERVER
 * Complete implementation without any mock data
 * Handles actual user registration, login, and authorization
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"]
        }
    }
}));

// Global rate limiting
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Only log errors
}));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📞 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    
    // Log request body (excluding sensitive data)
    if (req.body && Object.keys(req.body).length > 0) {
        const logBody = { ...req.body };
        if (logBody.password) logBody.password = '[REDACTED]';
        if (logBody.currentPassword) logBody.currentPassword = '[REDACTED]';
        if (logBody.newPassword) logBody.newPassword = '[REDACTED]';
        console.log('📦 Request Body:', logBody);
    }
    
    next();
});

// MongoDB Connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnpath-production';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log('📦 Connected to MongoDB - Production Database');
        console.log(`🔗 Database: ${mongoose.connection.db.databaseName}`);
        
        // Set up connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('📦 MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('📦 MongoDB connection closed due to application termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
};

// Initialize database connection
connectDB();

// Import authentication routes
const authRoutes = require('./routes/authReal');

// API Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API information endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'LearnPath Production Authentication API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        features: [
            '🔐 JWT Authentication with Refresh Tokens',
            '🛡️ Role-based Authorization (Student, Instructor, Admin)',
            '🔑 Permission-based Access Control',
            '🚦 Rate Limiting & Security Headers',
            '🔒 Account Lockout Protection',
            '📊 User Activity Logging',
            '💾 Production MongoDB Integration',
            '🔍 Input Validation & Sanitization'
        ],
        endpoints: {
            authentication: {
                'POST /api/auth/register': 'Register new user',
                'POST /api/auth/login': 'User login',
                'POST /api/auth/logout': 'User logout (Protected)',
                'GET /api/auth/me': 'Get user profile (Protected)',
                'PUT /api/auth/me': 'Update user profile (Protected)',
                'POST /api/auth/change-password': 'Change password (Protected)',
                'DELETE /api/auth/me': 'Delete account (Protected)'
            },
            admin: {
                'GET /api/auth/users': 'Get all users (Admin only)',
                'GET /api/auth/instructors': 'Get all instructors (Admin only)',
                'GET /api/auth/stats': 'Get system statistics (Admin only)'
            },
            instructor: {
                'GET /api/auth/students': 'Get students list (Instructor/Admin only)'
            },
            system: {
                'GET /health': 'Health check',
                'GET /': 'API information'
            }
        },
        security: {
            rateLimit: '200 requests per 15 minutes globally',
            authRateLimit: '5 requests per 15 minutes for auth endpoints',
            passwordPolicy: 'Minimum 6 characters',
            accountLockout: '5 failed attempts = 2 hours lock',
            tokenExpiry: 'Access: 15 minutes, Refresh: 7 days'
        }
    });
});

// 404 handler
app.all('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('🚨 Unhandled Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    });

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        message: isDevelopment ? error.message : 'Internal server error',
        ...(isDevelopment && { stack: error.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
    console.log('🚀 REAL PRODUCTION AUTH SERVER STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔗 Server running on port ${PORT}`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`💾 Database: ${mongoose.connection.db ? mongoose.connection.db.databaseName : 'Connecting...'}`);
    console.log(`🛡️ Security: Rate limiting, CORS, Helmet enabled`);
    console.log(`📊 Logging: Request logging and error tracking active`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ READY TO HANDLE REAL USER AUTHENTICATION');
    console.log('\n📋 Available Features:');
    console.log('   • User Registration (Student/Instructor)');
    console.log('   • Secure Login with JWT');
    console.log('   • Role-based Access Control');
    console.log('   • Account Management');
    console.log('   • Admin Dashboard');
    console.log('   • Security Protection');
    console.log('\n🔥 NO MOCK DATA - REAL PRODUCTION READY!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📤 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('📤 Process terminated');
    });
});

module.exports = app;