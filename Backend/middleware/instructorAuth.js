/**
 * Instructor Authorization Middleware
 * Checks if user is an instructor and has instructor profile
 */

const User = require('../models/UserReal');
const Instructor = require('../models/Instructor');

/**
 * Verify user is an instructor
 */
const verifyInstructor = async (req, res, next) => {
    try {
        console.log('🎓 Verifying instructor role...');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No user found in request'
            });
        }

        // Check if user role is instructor
        if (req.user.role !== 'instructor') {
            console.log(`❌ User ${req.user.email} is not an instructor (role: ${req.user.role})`);
            return res.status(403).json({
                success: false,
                message: 'This action is only available for instructors'
            });
        }

        // Check if instructor profile exists
        const instructorProfile = await Instructor.findOne({ userId: req.user._id });
        
        if (!instructorProfile) {
            console.log(`⚠️ Instructor profile not found for user ${req.user.email}`);
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found. Please contact admin.'
            });
        }

        // Check if instructor is active
        if (!instructorProfile.isActive) {
            console.log(`⛔ Instructor ${instructorProfile.name} is inactive`);
            return res.status(403).json({
                success: false,
                message: 'Your instructor account is inactive'
            });
        }

        // Attach instructor profile to request
        req.instructor = instructorProfile;
        console.log(`✅ Instructor verified: ${instructorProfile.name}`);
        
        next();

    } catch (error) {
        console.error('💥 Instructor verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying instructor status',
            error: error.message
        });
    }
};

/**
 * Verify instructor owns a course
 * Must be called after verifyInstructor
 */
const verifyInstructorOwnssCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        const Course = require('../models/Course');
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if course belongs to this instructor
        if (course.instructorId.toString() !== req.instructor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to modify this course'
            });
        }

        // Attach course to request
        req.course = course;
        next();

    } catch (error) {
        console.error('💥 Course ownership verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying course ownership',
            error: error.message
        });
    }
};

/**
 * Verify instructor is verified (optional)
 * Some premium features may require verification
 */
const verifyInstructorVerification = (req, res, next) => {
    if (!req.instructor.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'This feature requires instructor verification. Please contact admin.'
        });
    }
    next();
};

module.exports = {
    verifyInstructor,
    verifyInstructorOwnssCourse,
    verifyInstructorVerification
};
