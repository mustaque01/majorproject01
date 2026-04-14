/**
 * Instructor Courses Controller
 * Handles course operations for instructors managing their own courses
 */

const Course = require('../models/Course');
const Instructor = require('../models/Instructor');
const Category = require('../models/Category');

/**
 * Get current logged-in instructor's profile
 */
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const instructor = await Instructor.findOne({ userId })
            .select('-userId');

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found. Please contact admin.'
            });
        }

        // Get instructor's courses
        const courses = await Course.find({ instructorId: instructor._id, status: { $in: ['active', 'draft'] } })
            .select('id title level price rating enrolledStudents status createdAt')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                profile: instructor,
                courses: courses,
                statistics: {
                    totalCourses: courses.length,
                    activeCourses: courses.filter(c => c.status === 'active').length,
                    draftCourses: courses.filter(c => c.status === 'draft').length,
                    totalStudents: instructor.totalStudents,
                    averageRating: instructor.averageRating,
                    yearsOfExperience: instructor.yearsOfExperience
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching instructor profile',
            error: error.message
        });
    }
};

/**
 * Update instructor's own profile
 */
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            name, 
            bio, 
            specialization, 
            yearsOfExperience, 
            skills, 
            certifications,
            profileImage,
            socialLinks 
        } = req.body;

        const instructor = await Instructor.findOne({ userId });

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Update allowed fields
        if (name) instructor.name = name;
        if (bio) instructor.bio = bio;
        if (specialization) instructor.specialization = specialization;
        if (yearsOfExperience !== undefined) instructor.yearsOfExperience = yearsOfExperience;
        if (skills) instructor.skills = skills;
        if (certifications) instructor.certifications = certifications;
        if (profileImage) instructor.profileImage = profileImage;
        if (socialLinks) instructor.socialLinks = { ...instructor.socialLinks, ...socialLinks };

        instructor.updatedAt = new Date();
        await instructor.save();

        res.status(200).json({
            success: true,
            message: 'Instructor profile updated successfully',
            data: instructor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating instructor profile',
            error: error.message
        });
    }
};

/**
 * Get instructor's all courses (including drafts)
 */
const getMyCourses = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = req.query;

        const instructor = await Instructor.findOne({ userId });

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Build filter
        const filter = { instructorId: instructor._id };
        if (status) {
            filter.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const courses = await Course.find(filter)
            .select('id title level price rating enrolledStudents status duration skills difficulty tags createdAt')
            .sort({ [sortBy]: parseInt(sortOrder) })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

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
 * Create new course as instructor
 */
const createCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            title,
            description,
            categoryId,
            duration,
            level,
            price,
            topics,
            skills,
            requirements,
            certification,
            difficulty,
            tags,
            thumbnail,
            prerequisites
        } = req.body;

        // Validate required fields
        if (!title || !description || !categoryId || !duration || !level) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, description, categoryId, duration, level'
            });
        }

        // Get instructor
        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
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

        // Create course
        const newCourse = new Course({
            title,
            description,
            categoryId,
            instructorId: instructor._id,
            duration,
            level,
            price: price || 0,
            topics: topics || [],
            skills: skills || [],
            requirements: requirements || [],
            certification: certification || { offered: false },
            difficulty: difficulty || 5,
            tags: tags || [],
            thumbnail: thumbnail || '',
            prerequisites: prerequisites || [],
            status: 'draft', // New courses start as draft
            resources: [],
            enrolledStudents: 0,
            rating: 0,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await newCourse.save();

        // Update category course count
        await Category.findByIdAndUpdate(categoryId, { $inc: { totalCourses: 1 } });

        res.status(201).json({
            success: true,
            message: 'Course created successfully. It\'s currently in DRAFT status.',
            data: {
                _id: newCourse._id,
                title: newCourse.title,
                status: newCourse.status,
                instructorId: newCourse.instructorId,
                categoryId: newCourse.categoryId
            }
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
 * Update instructor's own course
 */
const updateCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;
        const updates = req.body;

        // Get instructor
        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.instructorId.toString() !== instructor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own courses'
            });
        }

        // Don't allow changing instructor
        delete updates.instructorId;
        delete updates.enrolledStudents;

        // Update course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse
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
 * Publish course (change status from draft to active)
 */
const publishCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        // Get instructor
        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.instructorId.toString() !== instructor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only publish your own courses'
            });
        }

        // Validate course has minimum required fields
        if (!course.title || !course.description || !course.topics || course.topics.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Course must have title, description, and at least one topic to publish'
            });
        }

        if (course.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: `Course is already ${course.status}`
            });
        }

        course.status = 'active';
        course.updatedAt = new Date();
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course published successfully',
            data: {
                courseId: course._id,
                title: course.title,
                status: course.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error publishing course',
            error: error.message
        });
    }
};

/**
 * Unpublish course (change status from active to draft)
 */
const unpublishCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        // Get instructor
        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.instructorId.toString() !== instructor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only unpublish your own courses'
            });
        }

        if (course.status === 'active' && course.enrolledStudents > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot unpublish course with active enrollments'
            });
        }

        course.status = 'draft';
        course.updatedAt = new Date();
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course unpublished successfully',
            data: {
                courseId: course._id,
                title: course.title,
                status: course.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error unpublishing course',
            error: error.message
        });
    }
};

/**
 * Delete instructor's own course
 */
const deleteCourse = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        // Get instructor
        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.instructorId.toString() !== instructor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own courses'
            });
        }

        // Don't allow deleting courses with enrollments
        if (course.enrolledStudents > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete courses with active enrollments'
            });
        }

        // Delete course
        await Course.findByIdAndDelete(courseId);

        // Update category
        await Category.findByIdAndUpdate(course.categoryId, { $inc: { totalCourses: -1 } });

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting course',
            error: error.message
        });
    }
};

/**
 * Get course statistics
 */
const getCourseStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        // Get instructor
        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Find course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check ownership
        if (course.instructorId.toString() !== instructor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view stats for your own courses'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                courseId: course._id,
                title: course.title,
                status: course.status,
                statistics: {
                    enrolledStudents: course.enrolledStudents,
                    averageRating: course.rating,
                    totalViews: course.views || 0,
                    completionRate: course.completionRate || 0,
                    averageTimeSpent: course.averageTimeSpent || 0
                },
                metadata: {
                    level: course.level,
                    duration: course.duration,
                    price: course.price,
                    skillsTaught: course.skills,
                    prerequisites: course.prerequisites
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching course statistics',
            error: error.message
        });
    }
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getMyCourses,
    createCourse,
    updateCourse,
    publishCourse,
    unpublishCourse,
    deleteCourse,
    getCourseStats
};
