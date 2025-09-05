const express = require('express');
const router = express.Router();

// Import models and validation
const Category = require('../models/Category');
const Course = require('../models/Course');
const validateData = require('../validation/validateData');

// Validation Middleware
const validateParams = (req, res, next) => {
    const validation = validateData.params.id(parseInt(req.params.id));
    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: validation.error
        });
    }
    req.validatedId = validation.data;
    next();
};

// Routes

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort({ id: 1 });
        res.json({
            success: true,
            data: categories,
            total: categories.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
});

// Get category by ID
router.get('/:id', validateParams, async (req, res) => {
    try {
        const categoryId = req.validatedId;
        const category = await Category.findOne({ id: categoryId });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
});

// Get courses by category
router.get('/:id/courses', validateParams, async (req, res) => {
    try {
        const categoryId = req.validatedId;
        const category = await Category.findOne({ id: categoryId });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        const coursesInCategory = await Course.find({ categoryId: categoryId }).sort({ id: 1 });
        
        res.json({
            success: true,
            data: {
                category: category,
                courses: coursesInCategory,
                total: coursesInCategory.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses by category',
            error: error.message
        });
    }
});

// Get all courses
router.get('/courses/all', async (req, res) => {
    try {
        const courses = await Course.find().sort({ id: 1 });
        res.json({
            success: true,
            data: courses,
            total: courses.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching courses',
            error: error.message
        });
    }
});

// Get course by ID
router.get('/courses/:id', validateParams, async (req, res) => {
    try {
        const courseId = req.validatedId;
        const course = await Course.findOne({ id: courseId });
        
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }
        
        res.json({
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
});

// Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const completedCourses = await Course.countDocuments({ progress: 100 });
        const totalCategories = await Category.countDocuments();
        
        // Calculate total hours and resources
        const courses = await Course.find({}, 'duration resources');
        const totalHours = courses.reduce((sum, course) => {
            return sum + parseFloat(course.duration.split(' ')[0]);
        }, 0);
        const totalResources = courses.reduce((sum, course) => {
            return sum + course.resources.length;
        }, 0);
        
        res.json({
            success: true,
            data: {
                totalLearningPaths: totalCourses,
                completedSkills: completedCourses,
                totalHours: totalHours.toFixed(1),
                resources: totalResources,
                categories: totalCategories
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

// POST Routes with Validation

// Create new category
router.post('/', async (req, res) => {
    try {
        const validation = validateData.category(req.body);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }
        
        // Check if category with same ID already exists
        const existingCategory = await Category.findOne({ id: validation.data.id });
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: 'Category with this ID already exists'
            });
        }
        
        // Create new category
        const newCategory = new Category(validation.data);
        await newCategory.save();
        
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
});

// Create new course
router.post('/courses', async (req, res) => {
    try {
        const validation = validateData.course(req.body);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Course validation failed',
                errors: validation.errors
            });
        }
        
        // Check if category exists
        const categoryExists = await Category.findOne({ id: validation.data.categoryId });
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Category does not exist'
            });
        }
        
        // Check if course with same ID already exists
        const existingCourse = await Course.findOne({ id: validation.data.id });
        if (existingCourse) {
            return res.status(409).json({
                success: false,
                message: 'Course with this ID already exists'
            });
        }
        
        // Create new course
        const newCourse = new Course(validation.data);
        await newCourse.save();
        
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: newCourse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating course',
            error: error.message
        });
    }
});

// Database validation endpoint
router.get('/validate/all', async (req, res) => {
    try {
        const categories = await Category.find();
        const courses = await Course.find();
        
        const categoryValidation = validateData.categories(categories);
        const courseValidation = validateData.courses(courses);
        
        res.json({
            success: true,
            validation: {
                categories: categoryValidation,
                courses: courseValidation,
                overall: {
                    isValid: categoryValidation.isValid && courseValidation.isValid,
                    totalItems: categoryValidation.summary.total + courseValidation.summary.total,
                    validItems: categoryValidation.summary.valid + courseValidation.summary.valid,
                    invalidItems: categoryValidation.summary.invalid + courseValidation.summary.invalid
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error validating data',
            error: error.message
        });
    }
});

module.exports = router;
