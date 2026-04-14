const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    },
    id: {
        type: Number
    },
    title: {
        type: String,
        minlength: 3,
        maxlength: 100
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link', 'note']
    },
    size: {
        type: String
    },
    duration: {
        type: String
    },
    url: {
        type: String
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
});

const courseSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 500
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
        required: true
    },
    instructor: {
        type: String,
        maxlength: 50
    },
    duration: {
        type: String,
        required: true,
        match: /^\d+(\.\d+)?\s*hours?$/i
    },
    level: {
        type: String,
        required: true,
        enum: [
            'Beginner', 
            'Intermediate', 
            'Advanced', 
            'Beginner to Intermediate', 
            'Intermediate to Advanced',
            'Beginner to Advanced'
        ]
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        max: 999.99
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    enrolledStudents: {
        type: Number,
        required: true,
        min: 0
    },
    thumbnail: {
        type: String,
        required: true,
        match: /^https?:\/\/.+/
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    },
    topics: [{
        type: String,
        minlength: 3,
        maxlength: 50
    }],
    resources: [resourceSchema],
    progress: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    },

    // NEW FIELDS FOR IMPROVEMENTS
    skills: [{
        type: String,
        maxlength: [50, 'Skill cannot exceed 50 characters']
    }],
    prerequisites: [{
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        courseName: String
    }],
    requirements: [{
        type: String,
        maxlength: [200, 'Requirement cannot exceed 200 characters']
    }],
    certification: {
        offered: {
            type: Boolean,
            default: false
        },
        certificateName: String,
        certificateIcon: String
    },
    difficulty: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
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
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Create indexes for better performance
courseSchema.index({ id: 1 });
courseSchema.index({ categoryId: 1 });
courseSchema.index({ instructorId: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ rating: -1 });
courseSchema.index({ trending: 1 });
courseSchema.index({ isPopular: 1 });

module.exports = mongoose.model('Course', courseSchema);
