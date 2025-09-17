const express = require('express');
const jwt = require('jsonwebtoken');

console.log('🔍 Loading Student model...');
const Student = require('../models/Student');
console.log('✅ Student model loaded');

console.log('🔍 Loading Instructor model...');
const Instructor = require('../models/Instructor');
console.log('✅ Instructor model loaded');

const router = express.Router();

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper function to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Helper function to send token response
const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  });
};

// @desc    Register a new user (Student or Instructor)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { role, ...userData } = req.body;
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'password'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`
        });
      }
    }
    
    // Check if user already exists
    const existingStudent = await Student.findByEmail(userData.email);
    const existingInstructor = await Instructor.findByEmail(userData.email);
    
    if (existingStudent || existingInstructor) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    let user;
    
    if (role === 'student') {
      // Validate student-specific fields
      if (!userData.institution) {
        return res.status(400).json({
          success: false,
          message: 'Institution is required for students'
        });
      }
      
      user = await Student.create(userData);
    } else if (role === 'instructor') {
      // Validate instructor-specific fields
      const instructorRequiredFields = ['department', 'experience', 'specialization'];
      for (const field of instructorRequiredFields) {
        if (!userData[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required for instructors`
          });
        }
      }
      
      user = await Instructor.create(userData);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "student" or "instructor"'
      });
    }
    
    createSendToken(user, 201, res);
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('🔍 Login attempt:', req.body);
    const { email, password, role } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    if (!role || !['student', 'instructor'].includes(role)) {
      console.log('❌ Invalid role:', role);
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid role (student or instructor)'
      });
    }
    
    let user;
    
    console.log('🔍 Looking for user:', { email, role });
    
    // Find user based on role
    if (role === 'student') {
      console.log('🔍 Searching for student...');
      user = await Student.findByEmail(email).select('+password');
      console.log('👨‍🎓 Student found:', user ? 'Yes' : 'No');
    } else {
      console.log('🔍 Searching for instructor...');
      user = await Instructor.findByEmail(email).select('+password');
      console.log('👨‍🏫 Instructor found:', user ? 'Yes' : 'No');
    }
    
    // Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account inactive');
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Update last login
    console.log('🔍 Updating last login...');
    await user.updateLastLogin();
    
    console.log('✅ Login successful');
    createSendToken(user, 200, res);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'student') {
      user = await Student.findById(req.user.id)
        .populate('enrolledCourses.courseId', 'title description difficulty duration')
        .populate('learningPaths.pathId', 'title description estimatedDuration');
    } else {
      user = await Instructor.findById(req.user.id)
        .populate('createdCourses.courseId', 'title description difficulty studentsEnrolled');
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    // Fields that can be updated
    const allowedFields = [
      'firstName', 'lastName', 'bio', 'phone', 'address',
      'profilePicture', 'dateOfBirth'
    ];
    
    // Additional fields based on role
    if (req.user.role === 'student') {
      allowedFields.push('institution', 'academicLevel', 'major', 'graduationYear', 'learningPreferences');
    } else {
      allowedFields.push('department', 'specialization', 'qualification', 'teachingAreas', 'languagesSpoken', 'currentInstitution', 'socialLinks', 'contentPreferences');
    }
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    let user;
    
    if (req.user.role === 'student') {
      user = await Student.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true
      });
    } else {
      user = await Instructor.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        user
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating user profile'
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    let user;
    
    if (req.user.role === 'student') {
      user = await Student.findById(req.user.id).select('+password');
    } else {
      user = await Instructor.findById(req.user.id).select('+password');
    }
    
    if (!user || !(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    user.password = newPassword;
    await user.save();
    
    createSendToken(user, 200, res);
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/me
// @access  Private
const deleteMe = async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'student') {
      user = await Student.findByIdAndUpdate(req.user.id, { isActive: false });
    } else {
      user = await Instructor.findByIdAndUpdate(req.user.id, { isActive: false });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account'
    });
  }
};

// Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/change-password', changePassword);
router.delete('/me', deleteMe);

module.exports = router;