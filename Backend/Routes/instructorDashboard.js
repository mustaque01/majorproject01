/**
 * Instructor Dashboard Routes
 * Complete API for instructor dashboard and analytics
 */

const express = require('express');
const router = express.Router();

// Controllers
const dashboardController = require('../controllers/instructorDashboardController');
const coursesController = require('../controllers/instructorCoursesController');

// Middleware
const { authenticateUser } = require('../middleware/authReal');
const { verifyInstructor, verifyInstructorOwnssCourse } = require('../middleware/instructorAuth');

/**
 * ============================================
 * DASHBOARD ENDPOINTS
 * ============================================
 */

/**
 * @route   GET /api/instructor/dashboard
 * @desc    Get complete instructor dashboard
 * @access  Instructor only
 * @returns Dashboard with stats, courses, performance metrics
 */
router.get(
    '/dashboard',
    authenticateUser,
    verifyInstructor,
    dashboardController.getDashboard
);

/**
 * @route   GET /api/instructor/performance-summary
 * @desc    Get performance summary
 * @access  Instructor only
 */
router.get(
    '/performance-summary',
    authenticateUser,
    verifyInstructor,
    dashboardController.getPerformanceSummary
);

/**
 * @route   GET /api/instructor/earnings?period=monthly
 * @desc    Get earnings report by period
 * @access  Instructor only
 * @query   period: daily, weekly, monthly, yearly
 */
router.get(
    '/earnings',
    authenticateUser,
    verifyInstructor,
    dashboardController.getEarningsReport
);

/**
 * @route   GET /api/instructor/reviews?page=1&limit=10&courseId=xxx
 * @desc    Get all reviews for instructor's courses
 * @access  Instructor only
 */
router.get(
    '/reviews',
    authenticateUser,
    verifyInstructor,
    dashboardController.getReviews
);

/**
 * ============================================
 * PROFILE ENDPOINTS
 * ============================================
 */

/**
 * @route   GET /api/instructor/profile
 * @desc    Get current instructor profile
 * @access  Instructor only
 */
router.get(
    '/profile',
    authenticateUser,
    verifyInstructor,
    coursesController.getMyProfile
);

/**
 * @route   PUT /api/instructor/profile
 * @desc    Update instructor profile
 * @access  Instructor only
 * @body    { name, bio, specialization, yearsOfExperience, skills, certifications, profileImage, socialLinks }
 */
router.put(
    '/profile',
    authenticateUser,
    verifyInstructor,
    coursesController.updateMyProfile
);

/**
 * ============================================
 * COURSE MANAGEMENT ENDPOINTS
 * ============================================
 */

/**
 * @route   GET /api/instructor/courses?status=active&page=1&limit=10
 * @desc    Get all courses created by instructor
 * @access  Instructor only
 * @query   status: active/draft, page, limit, sortBy, sortOrder
 */
router.get(
    '/courses',
    authenticateUser,
    verifyInstructor,
    coursesController.getMyCourses
);

/**
 * @route   POST /api/instructor/courses
 * @desc    Create new course
 * @access  Instructor only
 * @body    { title, description, categoryId, duration, level, price, topic, skills, requirements, difficulty, tags, thumbnail, prerequisites, certification }
 */
router.post(
    '/courses',
    authenticateUser,
    verifyInstructor,
    coursesController.createCourse
);

/**
 * @route   GET /api/instructor/courses/:courseId
 * @desc    Get course details
 * @access  Instructor only (course owner)
 */
router.get(
    '/courses/:courseId',
    authenticateUser,
    verifyInstructor,
    verifyInstructorOwnssCourse,
    (req, res) => {
        res.status(200).json({
            success: true,
            data: req.course
        });
    }
);

/**
 * @route   PUT /api/instructor/courses/:courseId
 * @desc    Update course
 * @access  Instructor only (course owner)
 * @body    { title, description, price, level, duration, topics, skills, difficulty, tags, thumbnail, certification, prerequisites }
 */
router.put(
    '/courses/:courseId',
    authenticateUser,
    verifyInstructor,
    verifyInstructorOwnssCourse,
    coursesController.updateCourse
);

/**
 * @route   DELETE /api/instructor/courses/:courseId
 * @desc    Delete course
 * @access  Instructor only (course owner)
 */
router.delete(
    '/courses/:courseId',
    authenticateUser,
    verifyInstructor,
    verifyInstructorOwnssCourse,
    coursesController.deleteCourse
);

/**
 * @route   POST /api/instructor/courses/:courseId/publish
 * @desc    Publish course (draft -> active)
 * @access  Instructor only (course owner)
 */
router.post(
    '/courses/:courseId/publish',
    authenticateUser,
    verifyInstructor,
    verifyInstructorOwnssCourse,
    coursesController.publishCourse
);

/**
 * @route   POST /api/instructor/courses/:courseId/unpublish
 * @desc    Unpublish course (active -> draft)
 * @access  Instructor only (course owner)
 */
router.post(
    '/courses/:courseId/unpublish',
    authenticateUser,
    verifyInstructor,
    verifyInstructorOwnssCourse,
    coursesController.unpublishCourse
);

/**
 * ============================================
 * ANALYTICS ENDPOINTS
 * ============================================
 */

/**
 * @route   GET /api/instructor/courses/:courseId/analytics
 * @desc    Get detailed analytics for a course
 * @access  Instructor only (course owner)
 */
router.get(
    '/courses/:courseId/analytics',
    authenticateUser,
    verifyInstructor,
    verifyInstructorOwnssCourse,
    dashboardController.getCourseAnalytics
);

/**
 * @route   GET /api/instructor/courses/:courseId/stats
 * @desc    Get course statistics
 * @access  Instructor only (course owner)
 */
router.get(
    '/courses/:courseId/stats',
    authenticateUser,
    verifyInstructor,
    verifyInstructorOwnssCourse,
    coursesController.getCourseStats
);

module.exports = router;
