const Joi = require('joi');
const { resourceSchema, categorySchema, courseSchema } = require('./schemas');

// Validation Functions
const validateData = {
    // Validate Category data
    category: (data) => {
        const { error, value } = categorySchema.validate(data, { 
            abortEarly: false,
            allowUnknown: false 
        });
        
        if (error) {
            return {
                isValid: false,
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context.value
                }))
            };
        }
        
        return {
            isValid: true,
            data: value
        };
    },

    // Validate Course data
    course: (data) => {
        const { error, value } = courseSchema.validate(data, { 
            abortEarly: false,
            allowUnknown: false 
        });
        
        if (error) {
            return {
                isValid: false,
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context.value
                }))
            };
        }
        
        return {
            isValid: true,
            data: value
        };
    },

    // Validate Resource data
    resource: (data) => {
        const { error, value } = resourceSchema.validate(data, { 
            abortEarly: false,
            allowUnknown: false 
        });
        
        if (error) {
            return {
                isValid: false,
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context.value
                }))
            };
        }
        
        return {
            isValid: true,
            data: value
        };
    },

    // Validate array of categories
    categories: (dataArray) => {
        const results = dataArray.map((item, index) => {
            const validation = validateData.category(item);
            return {
                index,
                ...validation
            };
        });
        
        const hasErrors = results.some(result => !result.isValid);
        
        return {
            isValid: !hasErrors,
            results,
            summary: {
                total: dataArray.length,
                valid: results.filter(r => r.isValid).length,
                invalid: results.filter(r => !r.isValid).length
            }
        };
    },

    // Validate array of courses
    courses: (dataArray) => {
        const results = dataArray.map((item, index) => {
            const validation = validateData.course(item);
            return {
                index,
                ...validation
            };
        });
        
        const hasErrors = results.some(result => !result.isValid);
        
        return {
            isValid: !hasErrors,
            results,
            summary: {
                total: dataArray.length,
                valid: results.filter(r => r.isValid).length,
                invalid: results.filter(r => !r.isValid).length
            }
        };
    },

    // Validate request parameters
    params: {
        id: (id) => {
            const schema = Joi.number().integer().positive().required();
            const { error, value } = schema.validate(id);
            
            if (error) {
                return {
                    isValid: false,
                    error: 'Invalid ID parameter. Must be a positive integer.'
                };
            }
            
            return {
                isValid: true,
                data: value
            };
        }
    }
};

module.exports = validateData;
