/**
 * Course Routes
 * API endpoints for managing courses
 */

const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
// const { authenticate, authorize } = require('../middleware/auth');

/**
 * Public Routes
 */

// Get all courses with filters
router.get('/', courseController.getAllCourses);

// Get single course
router.get('/:id', courseController.getCourseById);

// Get courses by category
router.get('/category/:categoryId', courseController.getCoursesByCategory);

// Get courses by instructor
router.get('/instructor/:instructorId', courseController.getCoursesByInstructor);

// Get trending courses
router.get('/trending/courses', courseController.getTrendingCourses);

// Get popular courses
router.get('/popular/courses', courseController.getPopularCourses);

// Get course prerequisites
router.get('/:courseId/prerequisites', courseController.getCoursePrerequisites);

/**
 * Protected Routes (Admin/Instructor only)
 */

// Create course
// router.post('/', authenticate, authorize(['instructor', 'admin']), courseController.createCourse);

// Update course
// router.put('/:id', authenticate, authorize(['instructor', 'admin']), courseController.updateCourse);

// Delete course
// router.delete('/:id', authenticate, authorize(['admin']), courseController.deleteCourse);

module.exports = router;
