/**
 * Resources Controller
 * Handles CRUD operations for learning resources (PDFs, videos, links, notes)
 */

const Resource = require('../models/Resource');
const mongoose = require('mongoose');

/**
 * @desc    Get all resources for the authenticated user
 * @route   GET /api/resources
 * @access  Private
 */
const getResources = async (req, res) => {
    try {
        const { type, category, search, isFavorite, isCompleted, sortBy, sortOrder, page = 1, limit = 20 } = req.query;
        
        console.log('🔍 Getting resources for user:', req.user.email);

        // Build filter object
        const filters = {
            type,
            category,
            isFavorite: isFavorite ? isFavorite === 'true' : undefined,
            isCompleted: isCompleted ? isCompleted === 'true' : undefined,
            sortBy: sortBy || 'createdAt',
            sortOrder: sortOrder === 'asc' ? 1 : -1,
            limit: parseInt(limit)
        };

        // Get resources
        const resources = await Resource.searchResources(req.user._id, search, filters)
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Get total count for pagination
        const totalQuery = {
            userId: req.user._id,
            isActive: true
        };

        if (search) {
            totalQuery.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (type) totalQuery.type = type;
        if (category) totalQuery.category = category;
        if (isFavorite !== undefined) totalQuery.isFavorite = isFavorite === 'true';
        if (isCompleted !== undefined) totalQuery.isCompleted = isCompleted === 'true';

        const total = await Resource.countDocuments(totalQuery);

        console.log(`✅ Retrieved ${resources.length} resources`);

        res.json({
            success: true,
            data: {
                resources,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    total,
                    hasNext: parseInt(page) * parseInt(limit) < total,
                    hasPrev: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('💥 Get resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving resources'
        });
    }
};

/**
 * @desc    Get resource statistics for the user
 * @route   GET /api/resources/stats
 * @access  Private
 */
const getResourceStats = async (req, res) => {
    try {
        console.log('📊 Getting resource statistics for user:', req.user.email);

        const stats = await Resource.getUserStats(req.user._id);
        
        // Calculate totals
        const totals = {
            count: 0,
            completed: 0,
            favorites: 0
        };

        Object.values(stats).forEach(typeStat => {
            totals.count += typeStat.count;
            totals.completed += typeStat.completed;
            totals.favorites += typeStat.favorites;
        });

        console.log('✅ Resource statistics calculated');

        res.json({
            success: true,
            data: {
                byType: stats,
                totals
            }
        });

    } catch (error) {
        console.error('💥 Get resource stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving resource statistics'
        });
    }
};

/**
 * @desc    Get single resource by ID
 * @route   GET /api/resources/:id
 * @access  Private
 */
const getResource = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        const resource = await Resource.findOne({
            _id: id,
            userId: req.user._id,
            isActive: true
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Mark as accessed
        await resource.markAsAccessed();

        console.log('✅ Resource retrieved and marked as accessed');

        res.json({
            success: true,
            data: { resource }
        });

    } catch (error) {
        console.error('💥 Get resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving resource'
        });
    }
};

/**
 * @desc    Create new resource
 * @route   POST /api/resources
 * @access  Private
 */
const createResource = async (req, res) => {
    try {
        const { title, description, type, content, category, tags, learningPathId, courseId } = req.body;

        console.log('📝 Creating new resource:', { title, type });

        // Validate required fields
        if (!title || !type) {
            return res.status(400).json({
                success: false,
                message: 'Title and type are required'
            });
        }

        // Validate type-specific content
        if (type === 'note' && !content?.text) {
            return res.status(400).json({
                success: false,
                message: 'Note content is required for note type resources'
            });
        }

        if (type === 'link' && !content?.url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required for link type resources'
            });
        }

        // Create resource data
        const resourceData = {
            title: title.trim(),
            description: description?.trim(),
            type,
            userId: req.user._id,
            content: content || {},
            category: category || 'general',
            tags: tags || [],
            learningPathId: learningPathId || null,
            courseId: courseId || null,
            source: 'created'
        };

        // Create resource
        const resource = new Resource(resourceData);
        await resource.save();

        console.log('✅ Resource created successfully with ID:', resource._id);

        res.status(201).json({
            success: true,
            message: 'Resource created successfully',
            data: { resource }
        });

    } catch (error) {
        console.error('💥 Create resource error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating resource'
        });
    }
};

/**
 * @desc    Update resource
 * @route   PUT /api/resources/:id
 * @access  Private
 */
const updateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content, category, tags, learningPathId, courseId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        console.log('📝 Updating resource:', id);

        const resource = await Resource.findOne({
            _id: id,
            userId: req.user._id,
            isActive: true
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Update fields
        if (title) resource.title = title.trim();
        if (description !== undefined) resource.description = description?.trim();
        if (content) resource.content = { ...resource.content, ...content };
        if (category) resource.category = category;
        if (tags) resource.tags = tags;
        if (learningPathId !== undefined) resource.learningPathId = learningPathId;
        if (courseId !== undefined) resource.courseId = courseId;

        await resource.save();

        console.log('✅ Resource updated successfully');

        res.json({
            success: true,
            message: 'Resource updated successfully',
            data: { resource }
        });

    } catch (error) {
        console.error('💥 Update resource error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating resource'
        });
    }
};

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Private
 */
const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        console.log('🗑️ Deleting resource:', id);

        const resource = await Resource.findOne({
            _id: id,
            userId: req.user._id,
            isActive: true
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        // Soft delete
        resource.isActive = false;
        await resource.save();

        console.log('✅ Resource deleted successfully');

        res.json({
            success: true,
            message: 'Resource deleted successfully'
        });

    } catch (error) {
        console.error('💥 Delete resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting resource'
        });
    }
};

/**
 * @desc    Toggle resource favorite status
 * @route   POST /api/resources/:id/favorite
 * @access  Private
 */
const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        const resource = await Resource.findOne({
            _id: id,
            userId: req.user._id,
            isActive: true
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        await resource.toggleFavorite();

        console.log(`✅ Resource favorite status toggled to: ${resource.isFavorite}`);

        res.json({
            success: true,
            message: `Resource ${resource.isFavorite ? 'added to' : 'removed from'} favorites`,
            data: { isFavorite: resource.isFavorite }
        });

    } catch (error) {
        console.error('💥 Toggle favorite error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating favorite status'
        });
    }
};

/**
 * @desc    Mark resource as completed
 * @route   POST /api/resources/:id/complete
 * @access  Private
 */
const markAsCompleted = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid resource ID'
            });
        }

        const resource = await Resource.findOne({
            _id: id,
            userId: req.user._id,
            isActive: true
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found'
            });
        }

        await resource.markAsCompleted();

        console.log('✅ Resource marked as completed');

        res.json({
            success: true,
            message: 'Resource marked as completed',
            data: { 
                isCompleted: resource.isCompleted,
                completedAt: resource.completedAt
            }
        });

    } catch (error) {
        console.error('💥 Mark completed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking resource as completed'
        });
    }
};

module.exports = {
    getResources,
    getResourceStats,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    toggleFavorite,
    markAsCompleted
};