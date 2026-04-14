/**
 * Instructors Controller
 * Handles CRUD and statistics operations for instructors
 */

const Instructor = require('../models/Instructor');
const Course = require('../models/Course');

/**
 * Get all instructors
 */
const getAllInstructors = async (req, res) => {
    try {
        const { 
            specialization,
            search,
            isVerified = true,
            sortBy = 'averageRating',
            sortOrder = -1,
            page = 1, 
            limit = 10 
        } = req.query;

        // Build filter
        const filter = { isActive: true };

        if (isVerified !== undefined) {
            filter.isVerified = isVerified === 'true';
        }

        if (specialization) {
            filter.specialization = specialization;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
                { bio: { $regex: search, $options: 'i' } },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const instructors = await Instructor.find(filter)
            .select('-userId')
            .sort({ [sortBy]: parseInt(sortOrder) })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Instructor.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: instructors,
            pagination: {
                total,
                count: instructors.length,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching instructors',
            error: error.message
        });
    }
};

/**
 * Get instructor by ID
 */
const getInstructorById = async (req, res) => {
    try {
        const { id } = req.params;

        const instructor = await Instructor.findById(id)
            .select('-userId')
            .lean();

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        // Get instructor's courses
        const courses = await Course.find({ instructorId: id, status: 'active' })
            .select('id title level price rating enrolledStudents thumbnail')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                ...instructor,
                courses: courses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching instructor',
            error: error.message
        });
    }
};

/**
 * Get top instructors by rating
 */
const getTopInstructors = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const instructors = await Instructor.find({ isActive: true, isVerified: true })
            .select('name specialization averageRating profileImage bio skills totalStudents coursesCreated')
            .sort({ averageRating: -1 })
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: instructors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching top instructors',
            error: error.message
        });
    }
};

/**
 * Get instructor statistics
 */
const getInstructorStats = async (req, res) => {
    try {
        const { id } = req.params;

        const instructor = await Instructor.findById(id)
            .select('name totalStudents averageRating coursesCreated yearsOfExperience');

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        // Get detailed stats
        const courses = await Course.find({ instructorId: id, status: 'active' });
        const enrollmentStats = courses.reduce((acc, course) => ({
            totalEnrollments: acc.totalEnrollments + course.enrolledStudents,
            averageRating: acc.averageRating + (course.rating * course.enrolledStudents),
            totalCourses: acc.totalCourses + 1
        }), {
            totalEnrollments: 0,
            averageRating: 0,
            totalCourses: 0
        });

        const computedAverageRating = enrollmentStats.totalEnrollments > 0 
            ? (enrollmentStats.averageRating / enrollmentStats.totalEnrollments).toFixed(1)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                instructor: {
                    name: instructor.name,
                    yearsOfExperience: instructor.yearsOfExperience,
                    averageRating: instructor.averageRating
                },
                statistics: {
                    totalCourses: enrollmentStats.totalCourses,
                    totalEnrollments: enrollmentStats.totalEnrollments,
                    computedAverageRating: computedAverageRating,
                    coursesData: courses.map(c => ({
                        title: c.title,
                        enrollments: c.enrolledStudents,
                        rating: c.rating
                    }))
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching instructor statistics',
            error: error.message
        });
    }
};

/**
 * Search instructors by specialization
 */
const getInstructorsBySpecialization = async (req, res) => {
    try {
        const { specialization } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const instructors = await Instructor.find({ 
            specialization, 
            isActive: true,
            isVerified: true 
        })
            .select('name bio specialization averageRating profileImage skills')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ averageRating: -1 })
            .lean();

        const total = await Instructor.countDocuments({ 
            specialization, 
            isActive: true,
            isVerified: true 
        });

        res.status(200).json({
            success: true,
            data: instructors,
            pagination: {
                total,
                count: instructors.length,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching instructors by specialization',
            error: error.message
        });
    }
};

/**
 * Create instructor (Admin only)
 */
const createInstructor = async (req, res) => {
    try {
        const { name, email, specialization, userId, ...rest } = req.body;

        if (!name || !email || !specialization || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if instructor already exists
        const existingInstructor = await Instructor.findOne({ email });
        if (existingInstructor) {
            return res.status(409).json({
                success: false,
                message: 'Instructor with this email already exists'
            });
        }

        const newInstructor = new Instructor({
            name,
            email,
            specialization,
            userId,
            ...rest
        });

        await newInstructor.save();

        res.status(201).json({
            success: true,
            data: newInstructor,
            message: 'Instructor created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating instructor',
            error: error.message
        });
    }
};

/**
 * Update instructor
 */
const updateInstructor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow updating email or userId
        delete updates.email;
        delete updates.userId;

        const instructor = await Instructor.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: instructor,
            message: 'Instructor updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating instructor',
            error: error.message
        });
    }
};

/**
 * Delete instructor
 */
const deleteInstructor = async (req, res) => {
    try {
        const { id } = req.params;

        const instructor = await Instructor.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Instructor deactivated successfully',
            data: instructor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting instructor',
            error: error.message
        });
    }
};

module.exports = {
    getAllInstructors,
    getInstructorById,
    getTopInstructors,
    getInstructorStats,
    getInstructorsBySpecialization,
    createInstructor,
    updateInstructor,
    deleteInstructor
};
