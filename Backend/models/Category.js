const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 200
    },
    icon: {
        type: String,
        required: true,
        match: /^fas fa-[\w-]+$/
    },
    color: {
        type: String,
        required: true,
        match: /^#[0-9A-F]{6}$/i
    },

    // NEW METADATA FIELDS
    logo: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid logo URL'
        }
    },
    bannerImage: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid banner image URL'
        }
    },
    difficultyLevels: {
        type: [String],
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: ['Beginner', 'Intermediate', 'Advanced']
    },

    // Statistics
    totalCourses: {
        type: Number,
        default: 0,
        min: 0
    },
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

    // Category Details
    tags: [{
        type: String,
        maxlength: 30
    }],
    isPopular: {
        type: Boolean,
        default: false
    },
    trending: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create index for better performance
categorySchema.index({ id: 1 });
categorySchema.index({ name: 1 });
categorySchema.index({ isPopular: 1 });
categorySchema.index({ trending: 1 });
categorySchema.index({ displayOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
