/**
 * LEARNING PATH MODEL
 * Represents structured learning journeys with courses and progress tracking
 */

const mongoose = require('mongoose');

const learningPathSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Learning path title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: true,
        enum: ['programming', 'design', 'business', 'data-science', 'marketing', 'general'],
        default: 'general'
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    
    // Content Structure
    courses: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        order: {
            type: Number,
            required: true
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    }],
    
    // Path Metadata
    estimatedDuration: {
        hours: {
            type: Number,
            required: true,
            min: 0
        },
        weeks: {
            type: Number,
            default: 0
        }
    },
    
    // User Enrollment
    enrolledUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        startedAt: Date,
        completedAt: Date,
        currentCourse: {
            type: Number,
            default: 0
        },
        overallProgress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        timeSpent: {
            type: Number,
            default: 0 // in minutes
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    
    // Path Statistics
    totalEnrollments: {
        type: Number,
        default: 0
    },
    completionRate: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    
    // Creator Information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Status
    isPublished: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Tags and Keywords
    tags: [{
        type: String,
        trim: true
    }],
    
    // Path Image/Thumbnail
    thumbnail: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
learningPathSchema.index({ category: 1, difficulty: 1 });
learningPathSchema.index({ createdBy: 1 });
learningPathSchema.index({ 'enrolledUsers.userId': 1 });
learningPathSchema.index({ isPublished: 1, isActive: 1 });
learningPathSchema.index({ tags: 1 });

// Virtual for total courses
learningPathSchema.virtual('totalCourses').get(function() {
    return this.courses.length;
});

// Virtual for completed courses count
learningPathSchema.virtual('completedCourses').get(function() {
    return this.courses.filter(course => course.isCompleted).length;
});

// Virtual for enrollment count
learningPathSchema.virtual('enrollmentCount').get(function() {
    return this.enrolledUsers.filter(enrollment => enrollment.isActive).length;
});

// Method to calculate overall progress for a user
learningPathSchema.methods.calculateUserProgress = function(userId) {
    const userEnrollment = this.enrolledUsers.find(
        enrollment => enrollment.userId.toString() === userId.toString()
    );
    
    if (!userEnrollment) return 0;
    
    if (this.courses.length === 0) return 0;
    
    const totalProgress = this.courses.reduce((sum, course) => sum + course.progress, 0);
    return Math.round(totalProgress / this.courses.length);
};

// Method to enroll a user
learningPathSchema.methods.enrollUser = async function(userId) {
    const existingEnrollment = this.enrolledUsers.find(
        enrollment => enrollment.userId.toString() === userId.toString()
    );
    
    if (existingEnrollment) {
        if (!existingEnrollment.isActive) {
            existingEnrollment.isActive = true;
            existingEnrollment.enrolledAt = new Date();
        }
        return this.save();
    }
    
    this.enrolledUsers.push({
        userId,
        enrolledAt: new Date()
    });
    
    this.totalEnrollments += 1;
    return this.save();
};

// Method to update user progress
learningPathSchema.methods.updateUserProgress = async function(userId, courseIndex, progress) {
    const userEnrollment = this.enrolledUsers.find(
        enrollment => enrollment.userId.toString() === userId.toString()
    );
    
    if (!userEnrollment) {
        throw new Error('User not enrolled in this learning path');
    }
    
    if (courseIndex >= this.courses.length) {
        throw new Error('Invalid course index');
    }
    
    // Update course progress
    this.courses[courseIndex].progress = progress;
    
    // Mark as completed if progress is 100%
    if (progress >= 100 && !this.courses[courseIndex].isCompleted) {
        this.courses[courseIndex].isCompleted = true;
        this.courses[courseIndex].completedAt = new Date();
    }
    
    // Update overall progress
    userEnrollment.overallProgress = this.calculateUserProgress(userId);
    
    // Check if entire path is completed
    const allCoursesCompleted = this.courses.every(course => course.isCompleted);
    if (allCoursesCompleted && !userEnrollment.completedAt) {
        userEnrollment.completedAt = new Date();
    }
    
    return this.save();
};

// Static method to get user's learning paths
learningPathSchema.statics.getUserLearningPaths = async function(userId, status = 'all') {
    const query = {
        'enrolledUsers.userId': userId,
        isActive: true
    };
    
    if (status === 'active') {
        query['enrolledUsers.isActive'] = true;
        query['enrolledUsers.completedAt'] = { $exists: false };
    } else if (status === 'completed') {
        query['enrolledUsers.completedAt'] = { $exists: true };
    }
    
    return this.find(query)
        .populate('courses.courseId', 'title description duration')
        .populate('createdBy', 'firstName lastName')
        .sort({ 'enrolledUsers.enrolledAt': -1 });
};

// Static method to get popular learning paths
learningPathSchema.statics.getPopularPaths = async function(limit = 10) {
    return this.find({ isPublished: true, isActive: true })
        .sort({ totalEnrollments: -1, averageRating: -1 })
        .limit(limit)
        .populate('createdBy', 'firstName lastName');
};

module.exports = mongoose.model('LearningPath', learningPathSchema);