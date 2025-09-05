const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    type: {
        type: String,
        required: true,
        enum: ['PDF', 'Video', 'Link']
    },
    size: {
        type: String,
        validate: {
            validator: function(v) {
                if (this.type === 'PDF') {
                    return /^\d+(\.\d+)?\s*(MB|KB|GB)$/i.test(v);
                }
                return true;
            },
            message: 'Size format is invalid'
        }
    },
    duration: {
        type: String,
        validate: {
            validator: function(v) {
                if (this.type === 'Video') {
                    return /^\d{1,2}:\d{2}$/.test(v);
                }
                return true;
            },
            message: 'Duration format should be MM:SS'
        }
    },
    url: {
        type: String,
        validate: {
            validator: function(v) {
                if (this.type === 'Link') {
                    return /^https?:\/\/.+/.test(v);
                }
                return true;
            },
            message: 'Invalid URL format'
        }
    },
    progress: {
        type: Number,
        required: true,
        min: 0,
        max: 100
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
        type: Number,
        required: true,
        ref: 'Category'
    },
    instructor: {
        type: String,
        required: true,
        minlength: 3,
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
    }
}, {
    timestamps: true
});

// Create indexes for better performance
courseSchema.index({ id: 1 });
courseSchema.index({ categoryId: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ level: 1 });

module.exports = mongoose.model('Course', courseSchema);
