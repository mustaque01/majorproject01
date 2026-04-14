/**
 * Instructor Courses Routes
 * Protected routes for instructors to manage their own courses
 */

const express = require('express');
const router = express.Router();
const instructorCoursesController = require('../controllers/instructorCoursesController');
const { authenticateUser } = require('../middleware/authReal');

/**
 * All routes require authentication
 */

// Get current instructor's profile
router.get('/me/profile', authenticateUser, instructorCoursesController.getMyProfile);

// Update current instructor's profile
router.put('/me/profile', authenticateUser, instructorCoursesController.updateMyProfile);

// Get all courses for current instructor
router.get('/me/courses', authenticateUser, instructorCoursesController.getMyCourses);

// Create new course
router.post('/me/courses', authenticateUser, instructorCoursesController.createCourse);

// Get stats for a specific course
router.get('/me/courses/:courseId/stats', authenticateUser, instructorCoursesController.getCourseStats);

// Update specific course
router.put('/me/courses/:courseId', authenticateUser, instructorCoursesController.updateCourse);

// Publish course (draft -> active)
router.post('/me/courses/:courseId/publish', authenticateUser, instructorCoursesController.publishCourse);

// Unpublish course (active -> draft)
router.post('/me/courses/:courseId/unpublish', authenticateUser, instructorCoursesController.unpublishCourse);

// Delete course
router.delete('/me/courses/:courseId', authenticateUser, instructorCoursesController.deleteCourse);

module.exports = router;
