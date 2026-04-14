/**
 * Instructor Routes
 * API endpoints for managing instructors
 */

const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const { authenticateUser } = require('../middleware/authReal');

/**
 * Public Routes
 */

// Get all instructors with filtering
router.get('/', instructorController.getAllInstructors);

// Get top instructors by rating
router.get('/top/rated', instructorController.getTopInstructors);

// Get instructors by specialization
router.get('/specialization/:specialization', instructorController.getInstructorsBySpecialization);

// Get single instructor (must be last to avoid route conflicts)
router.get('/:id', instructorController.getInstructorById);

// Get instructor statistics
router.get('/:id/stats', instructorController.getInstructorStats);

/**
 * Protected Routes (Admin only)
 */

// Create instructor (Admin only)
router.post('/', authenticateUser, instructorController.createInstructor);

// Update instructor (Admin or self)
router.put('/:id', authenticateUser, instructorController.updateInstructor);

// Delete instructor (Admin only)
router.delete('/:id', authenticateUser, instructorController.deleteInstructor);

module.exports = router;
