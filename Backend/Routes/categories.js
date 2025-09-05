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

// Data validation endpoint
router.get('/validate/all', (req, res) => {
    const categoryValidation = validateData.categories(Category);
    const courseValidation = validateData.courses(Course);
    
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
});

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
router.get('/:id/courses', validateParams, (req, res) => {
    const categoryId = req.validatedId;
    const category = Category.find(c => c.id === categoryId);
    
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
    
    const coursesInCategory = Course.filter(c => c.categoryId === categoryId);
    
    // Validate courses data
    const coursesValidation = validateData.courses(coursesInCategory);
    if (!coursesValidation.isValid) {
        return res.status(500).json({
            success: false,
            message: 'Course data integrity error',
            validation: coursesValidation
        });
    }
    
    res.json({
        success: true,
        data: {
            category: category,
            courses: coursesInCategory,
            total: coursesInCategory.length
        }
    });
});

// Get all courses
router.get('/courses/all', (req, res) => {
    res.json({
        success: true,
        data: Course,
        total: Course.length
    });
});

// Get course by ID
router.get('/courses/:id', validateParams, (req, res) => {
    const courseId = req.validatedId;
    const course = Course.find(c => c.id === courseId);
    
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    
    // Validate the found course data
    const validation = validateData.course(course);
    if (!validation.isValid) {
        return res.status(500).json({
            success: false,
            message: 'Course data integrity error',
            errors: validation.errors
        });
    }
    
    res.json({
        success: true,
        data: validation.data
    });
});

// Get dashboard statistics
router.get('/stats/dashboard', (req, res) => {
    const totalCourses = Course.length;
    const completedCourses = Course.filter(c => c.progress === 100).length;
    const totalHours = Course.reduce((sum, course) => {
        return sum + parseFloat(course.duration.split(' ')[0]);
    }, 0);
    const totalResources = Course.reduce((sum, course) => {
        return sum + course.resources.length;
    }, 0);
    
    res.json({
        success: true,
        data: {
            totalLearningPaths: totalCourses,
            completedSkills: completedCourses,
            totalHours: totalHours.toFixed(1),
            resources: totalResources,
            categories: Category.length
        }
    });
});

// POST Routes with Validation

// Create new category
router.post('/', (req, res) => {
    const validation = validateData.category(req.body);
    
    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
        });
    }
    
    // Check if category with same ID already exists
    const existingCategory = Category.find(c => c.id === validation.data.id);
    if (existingCategory) {
        return res.status(409).json({
            success: false,
            message: 'Category with this ID already exists'
        });
    }
    
    // Add to categories array (in real app, this would be database)
    Category.push(validation.data);
    
    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: validation.data
    });
});

// Create new course
router.post('/courses', (req, res) => {
    const validation = validateData.course(req.body);
    
    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Course validation failed',
            errors: validation.errors
        });
    }
    
    // Check if category exists
    const categoryExists = Category.find(c => c.id === validation.data.categoryId);
    if (!categoryExists) {
        return res.status(400).json({
            success: false,
            message: 'Category does not exist'
        });
    }
    
    // Check if course with same ID already exists
    const existingCourse = Course.find(c => c.id === validation.data.id);
    if (existingCourse) {
        return res.status(409).json({
            success: false,
            message: 'Course with this ID already exists'
        });
    }
    
    // Add to courses array (in real app, this would be database)
    Course.push(validation.data);
    
    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: validation.data
    });
});

module.exports = router;

// Get all categories
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: Category,
        total: Category.length
    });
});

// Get category by ID
router.get('/:id', validateParams, (req, res) => {
    const categoryId = req.validatedId;
    const category = Category.find(c => c.id === categoryId);
    
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
    
    // Validate the found category data
    const validation = validateData.category(category);
    if (!validation.isValid) {
        return res.status(500).json({
            success: false,
            message: 'Data integrity error',
            errors: validation.errors
        });
    }
    
    res.json({
        success: true,
        data: validation.data
    });
});

// Get courses by category
router.get('/:id/courses', validateParams, (req, res) => {
    const categoryId = req.validatedId;
    const category = Category.find(c => c.id === categoryId);
    
    if (!category) {
        return res.status(404).json({
            success: false,
            message: 'Category not found'
        });
    }
    
    const coursesInCategory = Course.filter(c => c.categoryId === categoryId);
    
    // Validate courses data
    const coursesValidation = validateData.courses(coursesInCategory);
    if (!coursesValidation.isValid) {
        return res.status(500).json({
            success: false,
            message: 'Course data integrity error',
            validation: coursesValidation
        });
    }
    
    res.json({
        success: true,
        data: {
            category: category,
            courses: coursesInCategory,
            total: coursesInCategory.length
        }
    });
});

// Get all courses
router.get('/courses/all', (req, res) => {
    res.json({
        success: true,
        data: Course,
        total: Course.length
    });
});

// Get course by ID
router.get('/courses/:id', validateParams, (req, res) => {
    const courseId = req.validatedId;
    const course = Course.find(c => c.id === courseId);
    
    if (!course) {
        return res.status(404).json({
            success: false,
            message: 'Course not found'
        });
    }
    
    // Validate the found course data
    const validation = validateData.course(course);
    if (!validation.isValid) {
        return res.status(500).json({
            success: false,
            message: 'Course data integrity error',
            errors: validation.errors
        });
    }
    
    res.json({
        success: true,
        data: validation.data
    });
});

// Get dashboard statistics
router.get('/stats/dashboard', (req, res) => {
    const totalCourses = Course.length;
    const completedCourses = Course.filter(c => c.progress === 100).length;
    const totalHours = Course.reduce((sum, course) => {
        return sum + parseFloat(course.duration.split(' ')[0]);
    }, 0);
    const totalResources = Course.reduce((sum, course) => {
        return sum + course.resources.length;
    }, 0);
    
    res.json({
        success: true,
        data: {
            totalLearningPaths: totalCourses,
            completedSkills: completedCourses,
            totalHours: totalHours.toFixed(1),
            resources: totalResources,
            categories: Category.length
        }
    });
});

// POST Routes with Validation

// Create new category
router.post('/', (req, res) => {
    const validation = validateData.category(req.body);
    
    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
        });
    }
    
    // Check if category with same ID already exists
    const existingCategory = Category.find(c => c.id === validation.data.id);
    if (existingCategory) {
        return res.status(409).json({
            success: false,
            message: 'Category with this ID already exists'
        });
    }
    
    // Add to categories array (in real app, this would be database)
    Category.push(validation.data);
    
    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: validation.data
    });
});

// Create new course
router.post('/courses', (req, res) => {
    const validation = validateData.course(req.body);
    
    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: 'Course validation failed',
            errors: validation.errors
        });
    }
    
    // Check if category exists
    const categoryExists = Category.find(c => c.id === validation.data.categoryId);
    if (!categoryExists) {
        return res.status(400).json({
            success: false,
            message: 'Category does not exist'
        });
    }
    
    // Check if course with same ID already exists
    const existingCourse = Course.find(c => c.id === validation.data.id);
    if (existingCourse) {
        return res.status(409).json({
            success: false,
            message: 'Course with this ID already exists'
        });
    }
    
    // Add to courses array (in real app, this would be database)
    Course.push(validation.data);
    
    res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: validation.data
    });
});

module.exports = router;
