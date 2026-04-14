/**
 * Instructor Routes
 * API endpoints for managing instructors
 */

const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
// const { authenticate, authorize } = require('../middleware/auth');

/**
 * Public Routes
 */

// Get all instructors
router.get('/', instructorController.getAllInstructors);

// Get single instructor
router.get('/:id', instructorController.getInstructorById);

// Get top instructors
router.get('/top/rated', instructorController.getTopInstructors);

// Get instructor statistics
router.get('/:id/stats', instructorController.getInstructorStats);

// Get instructors by specialization
router.get('/specialization/:specialization', instructorController.getInstructorsBySpecialization);

/**
 * Protected Routes (Admin only)
 */

// Create instructor
// router.post('/', authenticate, authorize(['admin']), instructorController.createInstructor);

// Update instructor
// router.put('/:id', authenticate, authorize(['admin']), instructorController.updateInstructor);

// Delete instructor
// router.delete('/:id', authenticate, authorize(['admin']), instructorController.deleteInstructor);

module.exports = router;
