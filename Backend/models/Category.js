const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 200
    },
    icon: {
        type: String,
        required: true,
        match: /^fas fa-[\w-]+$/
    },
    color: {
        type: String,
        required: true,
        match: /^#[0-9A-F]{6}$/i
    }
}, {
    timestamps: true
});

// Create index for better performance
categorySchema.index({ id: 1 });
categorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', categorySchema);
