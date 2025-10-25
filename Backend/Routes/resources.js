/**
 * Resources Routes
 * Handles routing for learning resources endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
    getResources,
    getResourceStats,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    toggleFavorite,
    markAsCompleted
} = require('../controllers/resourceController');

const {
    authenticateUser,
    createRateLimit,
    logUserActivity
} = require('../middleware/authReal');

// Rate limiting
const generalRateLimit = createRateLimit(100, 15 * 60 * 1000); // 100 requests per 15 minutes
const createRateLimit_custom = createRateLimit(20, 15 * 60 * 1000); // 20 creates per 15 minutes

/**
 * @route   GET /api/resources
 * @desc    Get all resources for authenticated user with filtering and pagination
 * @access  Private
 * @query   type, category, search, isFavorite, isCompleted, sortBy, sortOrder, page, limit
 */
router.get('/',
    generalRateLimit,
    authenticateUser,
    logUserActivity('view_resources'),
    getResources
);

/**
 * @route   GET /api/resources/stats
 * @desc    Get resource statistics for authenticated user
 * @access  Private
 */
router.get('/stats',
    generalRateLimit,
    authenticateUser,
    logUserActivity('view_resource_stats'),
    getResourceStats
);

/**
 * @route   GET /api/resources/:id
 * @desc    Get single resource by ID
 * @access  Private
 */
router.get('/:id',
    generalRateLimit,
    authenticateUser,
    logUserActivity('view_resource'),
    getResource
);

/**
 * @route   POST /api/resources
 * @desc    Create new resource
 * @access  Private
 * @body    { title, description, type, content, category, tags, learningPathId, courseId }
 */
router.post('/',
    createRateLimit_custom,
    authenticateUser,
    logUserActivity('create_resource'),
    createResource
);

/**
 * @route   PUT /api/resources/:id
 * @desc    Update resource by ID
 * @access  Private
 * @body    { title?, description?, content?, category?, tags?, learningPathId?, courseId? }
 */
router.put('/:id',
    generalRateLimit,
    authenticateUser,
    logUserActivity('update_resource'),
    updateResource
);

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete resource by ID (soft delete)
 * @access  Private
 */
router.delete('/:id',
    generalRateLimit,
    authenticateUser,
    logUserActivity('delete_resource'),
    deleteResource
);

/**
 * @route   POST /api/resources/:id/favorite
 * @desc    Toggle resource favorite status
 * @access  Private
 */
router.post('/:id/favorite',
    generalRateLimit,
    authenticateUser,
    logUserActivity('toggle_favorite'),
    toggleFavorite
);

/**
 * @route   POST /api/resources/:id/complete
 * @desc    Mark resource as completed
 * @access  Private
 */
router.post('/:id/complete',
    generalRateLimit,
    authenticateUser,
    logUserActivity('complete_resource'),
    markAsCompleted
);

module.exports = router;