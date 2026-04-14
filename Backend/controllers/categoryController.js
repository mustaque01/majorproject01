/**
 * Categories Controller
 * Handles CRUD operations for course categories
 */

const Category = require('../models/Category');
const Course = require('../models/Course');

/**
 * Get all categories
 */
const getAllCategories = async (req, res) => {
    try {
        const { 
            search,
            isPopular,
            trending,
            sortBy = 'displayOrder',
            sortOrder = 1,
            page = 1, 
            limit = 50 
        } = req.query;

        // Build filter
        const filter = {};

        if (isPopular === 'true') filter.isPopular = true;
        if (trending === 'true') filter.trending = true;

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const categories = await Category.find(filter)
            .sort({ [sortBy]: parseInt(sortOrder) })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Category.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: categories,
            pagination: {
                total,
                count: categories.length,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

/**
 * Get category by ID
 */
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id).lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get courses in this category
        const courses = await Course.find({ categoryId: id, status: 'active' })
            .select('id title level price rating enrolledStudents thumbnail difficulty')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                ...category,
                courses: courses,
                courseCount: courses.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
};

/**
 * Get trending categories
 */
const getTrendingCategories = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const categories = await Category.find({ trending: true })
            .select('id name icon color description tags totalCourses totalStudents')
            .sort({ displayOrder: 1 })
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching trending categories',
            error: error.message
        });
    }
};

/**
 * Get popular categories
 */
const getPopularCategories = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const categories = await Category.find({ isPopular: true })
            .select('id name icon color description tags totalStudents')
            .sort({ totalStudents: -1 })
            .limit(parseInt(limit))
            .lean();

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching popular categories',
            error: error.message
        });
    }
};

/**
 * Get category statistics
 */
const getCategoryStats = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get detailed stats
        const courses = await Course.find({ categoryId: id, status: 'active' });

        const stats = {
            totalCourses: courses.length,
            totalStudents: courses.reduce((sum, course) => sum + course.enrolledStudents, 0),
            averageRating: courses.length > 0 
                ? (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)
                : 0,
            priceRange: {
                min: Math.min(...courses.map(c => c.price), 0),
                max: Math.max(...courses.map(c => c.price), 0),
                average: courses.length > 0
                    ? (courses.reduce((sum, course) => sum + course.price, 0) / courses.length).toFixed(2)
                    : 0
            },
            difficultyDistribution: {
                beginner: courses.filter(c => c.level === 'Beginner').length,
                intermediate: courses.filter(c => c.level === 'Intermediate').length,
                advanced: courses.filter(c => c.level === 'Advanced').length
            }
        };

        res.status(200).json({
            success: true,
            data: {
                category: {
                    id: category._id,
                    name: category.name,
                    description: category.description
                },
                statistics: stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category statistics',
            error: error.message
        });
    }
};

/**
 * Create category (Admin only)
 */
const createCategory = async (req, res) => {
    try {
        const { name, description, icon, color, ...rest } = req.body;

        if (!name || !description || !icon || !color) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const newCategory = new Category({
            name,
            description,
            icon,
            color,
            ...rest
        });

        await newCategory.save();

        res.status(201).json({
            success: true,
            data: newCategory,
            message: 'Category created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

/**
 * Update category
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category,
            message: 'Category updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

/**
 * Delete category
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has courses
        const courseCount = await Course.countDocuments({ categoryId: id });
        if (courseCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with existing courses'
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    getTrendingCategories,
    getPopularCategories,
    getCategoryStats,
    createCategory,
    updateCategory,
    deleteCategory
};
