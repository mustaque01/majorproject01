/**
 * Courses Controller
 * Enhanced CRUD operations for courses with improved data structure
 */

const Course = require('../models/Course');
const Category = require('../models/Category');
const Instructor = require('../models/Instructor');

/**
 * Get all courses with filters and pagination
 */
const getAllCourses = async (req, res) => {
    try {
        const { 
            categoryId, 
            instructorId, 
            level, 
            minPrice, 
            maxPrice, 
            minRating, 
            isPopular,
            trending,
            search,
            sortBy = 'createdAt',
            sortOrder = -1,
            page = 1, 
            limit = 10 
        } = req.query;

        // Build filter object
        const filter = { status: 'active' };

        if (categoryId) filter.categoryId = categoryId;
        if (instructorId) filter.instructorId = instructorId;
        if (level) filter.level = level;
        if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
        if (minRating) filter.rating = { $gte: parseFloat(minRating) };
        if (isPopular === 'true') filter.isPopular = true;
        if (trending === 'true') filter.trending = true;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { topics: { $in: [new RegExp(search, 'i')] } },
                { skills: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const courses = await Course.find(filter)
            .populate('instructorId categoryId')
            .sort({ [sortBy]: parseInt(sortOrder) })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count
        const total = await Course.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: courses,
            pagination: {
                total,
                count: courses.length,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
};

/**
 * Get single course by ID
 */
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id)
            .populate({
                path: 'instructorId',
                select: 'name email bio specialization yearsOfExperience profileImage socialLinks skills'
            })
            .populate({
                path: 'categoryId',
                select: 'name icon color description tags'
            })
            .populate({
                path: 'prerequisites.courseId',
                select: 'id title'
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching course',
            error: error.message
        });
    }
};

/**
 * Get courses by category
 */
const getCoursesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const courses = await Course.find({ categoryId, status: 'active' })
            .populate('instructorId')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Course.countDocuments({ categoryId, status: 'active' });

        res.status(200).json({
            success: true,
            data: courses,
            pagination: {
                total,
                count: courses.length,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses by category',
            error: error.message
        });
    }
};

/**
 * Get courses by instructor
 */
const getCoursesByInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const instructor = await Instructor.findById(instructorId);
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const courses = await Course.find({ instructorId, status: 'active' })
            .populate('categoryId')
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Course.countDocuments({ instructorId, status: 'active' });

        res.status(200).json({
            success: true,
            data: courses,
            instructor: {
                id: instructor._id,
                name: instructor.name,
                specialization: instructor.specialization
            },
            pagination: {
                total,
                count: courses.length,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses by instructor',
            error: error.message
        });
    }
};

/**
 * Get trending and popular courses
 */
const getTrendingCourses = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const courses = await Course.find({ status: 'active', trending: true })
            .populate('instructorId categoryId')
            .sort({ rating: -1 })
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trending courses',
            error: error.message
        });
    }
};

/**
 * Get popular courses
 */
const getPopularCourses = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const courses = await Course.find({ status: 'active', isPopular: true })
            .populate('instructorId categoryId')
            .sort({ enrolledStudents: -1 })
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching popular courses',
            error: error.message
        });
    }
};

/**
 * Get course prerequisites
 */
const getCoursePrerequisites = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId)
            .select('prerequisites title')
            .populate({
                path: 'prerequisites.courseId',
                select: 'id title duration level price rating'
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            course: {
                id: course._id,
                title: course.title
            },
            prerequisites: course.prerequisites
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching course prerequisites',
            error: error.message
        });
    }
};

/**
 * Create new course (Admin/Instructor only)
 */
const createCourse = async (req, res) => {
    try {
        const { title, description, categoryId, instructorId, level, price, ...rest } = req.body;

        // Validate required fields
        if (!title || !description || !categoryId || !instructorId || !level || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Verify category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Verify instructor exists
        const instructor = await Instructor.findById(instructorId);
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor not found'
            });
        }

        const newCourse = new Course({
            title,
            description,
            categoryId,
            instructorId,
            level,
            price,
            ...rest
        });

        await newCourse.save();

        res.status(201).json({
            success: true,
            data: newCourse,
            message: 'Course created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
};

/**
 * Update course
 */
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const course = await Course.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('instructorId categoryId');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course,
            message: 'Course updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating course',
            error: error.message
        });
    }
};

/**
 * Delete course
 */
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    getCoursesByCategory,
    getCoursesByInstructor,
    getTrendingCourses,
    getPopularCourses,
    getCoursePrerequisites,
    createCourse,
    updateCourse,
    deleteCourse
};
