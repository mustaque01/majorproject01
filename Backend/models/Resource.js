/**
 * Learning Resource Model
 * Handles PDF documents, video lectures, external links, and notes
 */

const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Resource title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
        type: String,
        required: [true, 'Resource type is required'],
        enum: {
            values: ['pdf', 'video', 'link', 'note'],
            message: 'Type must be pdf, video, link, or note'
        }
    },

    // User Association
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },

    // Content Information
    content: {
        // For notes - the actual text content
        text: {
            type: String,
            maxlength: [10000, 'Note content cannot exceed 10000 characters']
        },
        // For PDFs and videos - file information
        fileUrl: {
            type: String,
            trim: true
        },
        fileName: {
            type: String,
            trim: true
        },
        fileSize: {
            type: Number, // in bytes
        },
        // For external links
        url: {
            type: String,
            trim: true,
            validate: {
                validator: function(v) {
                    if (this.type === 'link' && v) {
                        return /^https?:\/\/.+/.test(v);
                    }
                    return true;
                },
                message: 'Please provide a valid URL'
            }
        },
        // For videos - additional metadata
        duration: {
            type: Number, // in seconds
        },
        thumbnail: {
            type: String,
            trim: true
        }
    },

    // Organization
    category: {
        type: String,
        enum: ['general', 'programming', 'design', 'business', 'science', 'mathematics', 'languages', 'other'],
        default: 'general'
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],

    // Learning Path Association (optional)
    learningPathId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LearningPath',
        default: null
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        default: null
    },

    // Progress and Interaction
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    accessCount: {
        type: Number,
        default: 0
    },

    // Favorites and Rating
    isFavorite: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },

    // Status and Visibility
    isActive: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: false // Private by default
    },

    // Metadata
    source: {
        type: String,
        enum: ['uploaded', 'created', 'bookmarked', 'shared'],
        default: 'created'
    },
    sharedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
ResourceSchema.index({ userId: 1, type: 1 });
ResourceSchema.index({ userId: 1, createdAt: -1 });
ResourceSchema.index({ category: 1, type: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ learningPathId: 1 });

// Virtual for formatted file size
ResourceSchema.virtual('formattedFileSize').get(function() {
    if (!this.content.fileSize) return null;
    
    const bytes = this.content.fileSize;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for formatted duration
ResourceSchema.virtual('formattedDuration').get(function() {
    if (!this.content.duration) return null;
    
    const seconds = this.content.duration;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
});

// Instance method to mark as accessed
ResourceSchema.methods.markAsAccessed = function() {
    this.lastAccessedAt = new Date();
    this.accessCount += 1;
    return this.save();
};

// Instance method to toggle favorite
ResourceSchema.methods.toggleFavorite = function() {
    this.isFavorite = !this.isFavorite;
    return this.save();
};

// Instance method to mark as completed
ResourceSchema.methods.markAsCompleted = function() {
    this.isCompleted = true;
    this.completedAt = new Date();
    return this.save();
};

// Static method to get user statistics
ResourceSchema.statics.getUserStats = async function(userId) {
    const stats = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), isActive: true } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                completed: {
                    $sum: { $cond: ['$isCompleted', 1, 0] }
                },
                favorites: {
                    $sum: { $cond: ['$isFavorite', 1, 0] }
                }
            }
        }
    ]);

    const result = {
        pdf: { count: 0, completed: 0, favorites: 0 },
        video: { count: 0, completed: 0, favorites: 0 },
        link: { count: 0, completed: 0, favorites: 0 },
        note: { count: 0, completed: 0, favorites: 0 }
    };

    stats.forEach(stat => {
        result[stat._id] = {
            count: stat.count,
            completed: stat.completed,
            favorites: stat.favorites
        };
    });

    return result;
};

// Static method to search resources
ResourceSchema.statics.searchResources = function(userId, query, filters = {}) {
    const searchQuery = {
        userId: mongoose.Types.ObjectId(userId),
        isActive: true
    };

    // Add text search
    if (query) {
        searchQuery.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
        ];
    }

    // Add filters
    if (filters.type) searchQuery.type = filters.type;
    if (filters.category) searchQuery.category = filters.category;
    if (filters.isFavorite !== undefined) searchQuery.isFavorite = filters.isFavorite;
    if (filters.isCompleted !== undefined) searchQuery.isCompleted = filters.isCompleted;

    return this.find(searchQuery)
        .sort({ [filters.sortBy || 'createdAt']: filters.sortOrder || -1 })
        .limit(filters.limit || 50);
};

module.exports = mongoose.model('Resource', ResourceSchema);