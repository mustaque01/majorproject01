/**
 * REAL USER MODEL FOR MONGODB
 * Production-ready Mongoose schema for user authentication
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Schema Definition
const UserSchema = new mongoose.Schema({
    // Basic Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },

    // Role and Permissions
    role: {
        type: String,
        required: [true, 'User role is required'],
        enum: {
            values: ['student', 'instructor', 'admin'],
            message: 'Role must be either student, instructor, or admin'
        }
    },
    permissions: [{
        type: String,
        enum: [
            'read:courses',
            'write:courses',
            'read:profile',
            'write:profile',
            'read:students',
            'write:students',
            'read:instructors',
            'write:instructors',
            'admin:all'
        ]
    }],

    // Profile Information (Role-specific)
    institution: {
        type: String,
        trim: true,
        maxlength: [100, 'Institution name cannot exceed 100 characters']
    },
    department: {
        type: String,
        trim: true,
        maxlength: [50, 'Department name cannot exceed 50 characters']
    },
    experience: {
        type: String,
        trim: true,
        maxlength: [200, 'Experience description cannot exceed 200 characters']
    },
    specialization: {
        type: String,
        trim: true,
        maxlength: [100, 'Specialization cannot exceed 100 characters']
    },

    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationExpires: {
        type: Date,
        select: false
    },

    // Security Features
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },

    // Refresh Tokens for JWT
    refreshTokens: [{
        token: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Reward System
    coins: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCoinsEarned: {
        type: Number,
        default: 0,
        min: 0
    },
    coinTransactions: [{
        type: {
            type: String,
            enum: ['earned', 'spent', 'bonus'],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        source: {
            type: String,
            required: true,
            enum: ['course_completion', 'course_progress', 'daily_login', 'achievement', 'bonus', 'purchase']
        },
        description: String,
        relatedId: mongoose.Schema.Types.ObjectId, // Course/Achievement ID
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Notifications System
    notifications: [{
        type: {
            type: String,
            enum: ['reward', 'achievement', 'course', 'system'],
            required: true
        },
        title: String,
        message: String,
        isRead: {
            type: Boolean,
            default: false
        },
        coins: Number, // Coins earned in this notification
        metadata: {
            courseId: mongoose.Schema.Types.ObjectId,
            achievementId: mongoose.Schema.Types.ObjectId,
            progressPercentage: Number
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Additional Metadata
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String

}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
        transform: function(doc, ret) {
            // Remove sensitive fields when converting to JSON
            delete ret.password;
            delete ret.refreshTokens;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            delete ret.__v;
            return ret;
        }
    }
});

// Virtual for checking if account is locked
UserSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
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

// Pre-save middleware to set permissions based on role
UserSchema.pre('save', function(next) {
    if (!this.isModified('role') && this.permissions.length > 0) {
        return next();
    }

    // Set default permissions based on role
    switch (this.role) {
        case 'student':
            this.permissions = ['read:courses', 'read:profile'];
            break;
        case 'instructor':
            this.permissions = [
                'read:courses',
                'write:courses',
                'read:profile',
                'write:profile',
                'read:students'
            ];
            break;
        case 'admin':
            this.permissions = ['admin:all'];
            break;
        default:
            this.permissions = ['read:profile'];
    }

    next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        if (!this.password) {
            throw new Error('User password not found');
        }
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Instance method to generate access token
UserSchema.methods.generateAccessToken = function() {
    const payload = {
        id: this._id,
        email: this.email,
        role: this.role,
        permissions: this.permissions,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-2024',
        { expiresIn: '15m' }
    );
};

// Instance method to generate refresh token
UserSchema.methods.generateRefreshToken = function() {
    const payload = {
        id: this._id,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-2024',
        { expiresIn: '7d' }
    );
};

// Instance method to handle failed login attempts
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

// Instance method to reset login attempts
UserSchema.methods.resetLoginAttempts = async function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Instance method to check permissions
UserSchema.methods.hasPermission = function(permission) {
    // Admin has all permissions
    if (this.role === 'admin' || this.permissions.includes('admin:all')) {
        return true;
    }

    return this.permissions.includes(permission);
};

// Instance method to check multiple permissions
UserSchema.methods.hasAnyPermission = function(permissions) {
    if (this.role === 'admin' || this.permissions.includes('admin:all')) {
        return true;
    }

    return permissions.some(permission => this.permissions.includes(permission));
};

// Instance method to award coins
UserSchema.methods.awardCoins = function(amount, source, description = '', relatedId = null) {
    this.coins += amount;
    this.totalCoinsEarned += amount;
    
    this.coinTransactions.push({
        type: 'earned',
        amount,
        source,
        description,
        relatedId,
        timestamp: new Date()
    });

    return this.save();
};

// Instance method to spend coins
UserSchema.methods.spendCoins = function(amount, source, description = '', relatedId = null) {
    if (this.coins < amount) {
        throw new Error('Insufficient coins');
    }

    this.coins -= amount;
    
    this.coinTransactions.push({
        type: 'spent',
        amount,
        source,
        description,
        relatedId,
        timestamp: new Date()
    });

    return this.save();
};

// Instance method to add notification
UserSchema.methods.addNotification = function(type, title, message, coins = 0, metadata = {}) {
    this.notifications.unshift({
        type,
        title,
        message,
        coins,
        metadata,
        timestamp: new Date()
    });

    // Keep only the latest 50 notifications
    if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50);
    }

    return this.save();
};

// Instance method to mark notification as read
UserSchema.methods.markNotificationAsRead = function(notificationId) {
    const notification = this.notifications.id(notificationId);
    if (notification) {
        notification.isRead = true;
        return this.save();
    }
    return Promise.resolve();
};

// Instance method to get unread notification count
UserSchema.methods.getUnreadNotificationCount = function() {
    return this.notifications.filter(n => !n.isRead).length;
};

// Instance method to generate email verification token
UserSchema.methods.generateEmailVerificationToken = function() {
    const token = jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-2024',
        { expiresIn: '24h' }
    );

    this.emailVerificationToken = token;
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return token;
};

// Instance method to generate password reset token
UserSchema.methods.generatePasswordResetToken = function() {
    const token = jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-2024',
        { expiresIn: '1h' }
    );

    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return token;
};

// Static method to find by email
UserSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users by role
UserSchema.statics.findActiveByRole = function(role) {
    return this.find({ role, isActive: true });
};

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Export the model
module.exports = mongoose.model('User', UserSchema);