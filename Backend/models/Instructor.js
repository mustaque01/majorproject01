/**
 * Instructor Model
 * Represents course instructors with their profiles and credentials
 */

const mongoose = require('mongoose');

const InstructorSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Instructor name is required'],
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters'],
        trim: true
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
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        trim: true
    },

    // Credentials & Expertise
    specialization: {
        type: String,
        required: true,
        maxlength: [100, 'Specialization cannot exceed 100 characters']
    },
    certifications: [{
        type: String,
        maxlength: [200, 'Certification cannot exceed 200 characters']
    }],
    yearsOfExperience: {
        type: Number,
        min: [0, 'Years of experience cannot be negative'],
        default: 0
    },
    skills: [{
        type: String,
        maxlength: [50, 'Skill cannot exceed 50 characters']
    }],

    // Social & Media
    profileImage: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid profile image URL'
        }
    },
    socialLinks: {
        twitter: String,
        linkedin: String,
        github: String,
        website: String
    },

    // Statistics
    totalStudents: {
        type: Number,
        default: 0,
        min: 0
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    coursesCreated: {
        type: Number,
        default: 0,
        min: 0
    },

    // Account Status
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    // Relationships
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserReal',
        required: true,
        unique: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create indexes
InstructorSchema.index({ name: 1 });
InstructorSchema.index({ email: 1 });
InstructorSchema.index({ specialization: 1 });
InstructorSchema.index({ isActive: 1 });
InstructorSchema.index({ averageRating: -1 });

module.exports = mongoose.model('Instructor', InstructorSchema);
