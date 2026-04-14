/**
 * Category Routes
 * API endpoints for managing course categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
// const { authenticate, authorize } = require('../middleware/auth');

/**
 * Public Routes
 */

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get single category
router.get('/:id', categoryController.getCategoryById);

// Get trending categories
router.get('/trending/categories', categoryController.getTrendingCategories);

// Get popular categories
router.get('/popular/categories', categoryController.getPopularCategories);

// Get category statistics
router.get('/:id/stats', categoryController.getCategoryStats);

/**
 * Protected Routes (Admin only)
 */

// Create category
// router.post('/', authenticate, authorize(['admin']), categoryController.createCategory);

// Update category
// router.put('/:id', authenticate, authorize(['admin']), categoryController.updateCategory);

// Delete category
// router.delete('/:id', authenticate, authorize(['admin']), categoryController.deleteCategory);

module.exports = router;
