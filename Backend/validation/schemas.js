const Joi = require('joi');

// Resource Schema
const resourceSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    title: Joi.string().min(3).max(100).required(),
    type: Joi.string().valid('PDF', 'Video', 'Link').required(),
    size: Joi.string().when('type', {
        is: Joi.valid('PDF'),
        then: Joi.string().regex(/^\d+(\.\d+)?\s*(MB|KB|GB)$/i).required(),
        otherwise: Joi.optional()
    }),
    duration: Joi.string().when('type', {
        is: 'Video',
        then: Joi.string().regex(/^\d{1,2}:\d{2}$/).required(),
        otherwise: Joi.optional()
    }),
    url: Joi.string().uri().when('type', {
        is: 'Link',
        then: Joi.required(),
        otherwise: Joi.optional()
    }),
    progress: Joi.number().min(0).max(100).required()
});

// Category Schema
const categorySchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().min(10).max(200).required(),
    icon: Joi.string().regex(/^fas fa-[\w-]+$/).required(),
    color: Joi.string().regex(/^#[0-9A-F]{6}$/i).required()
});

// Course Schema
const courseSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(20).max(500).required(),
    categoryId: Joi.number().integer().positive().required(),
    instructor: Joi.string().min(3).max(50).required(),
    duration: Joi.string().regex(/^\d+(\.\d+)?\s*hours?$/i).required(),
    level: Joi.string().valid(
        'Beginner', 
        'Intermediate', 
        'Advanced', 
        'Beginner to Intermediate', 
        'Intermediate to Advanced',
        'Beginner to Advanced'
    ).required(),
    price: Joi.number().min(0).max(999.99).required(),
    rating: Joi.number().min(0).max(5).required(),
    enrolledStudents: Joi.number().integer().min(0).required(),
    thumbnail: Joi.string().uri().required(),
    status: Joi.string().valid('active', 'inactive', 'draft').required(),
    topics: Joi.array().items(Joi.string().min(3).max(50)).min(1).max(10).required(),
    resources: Joi.array().items(resourceSchema).min(1).required(),
    progress: Joi.number().min(0).max(100).required(),
    createdAt: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
    updatedAt: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required()
});

module.exports = {
    resourceSchema,
    categorySchema,
    courseSchema
};
