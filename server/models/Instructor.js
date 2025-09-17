const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const instructorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    default: 'instructor',
    enum: ['instructor']
  },
  instructorId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values while maintaining uniqueness
    trim: true
  },
  // Professional Information
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    trim: true,
    maxlength: [100, 'Specialization cannot exceed 100 characters']
  },
  experience: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', 'More than 10 years']
  },
  qualification: {
    degree: {
      type: String,
      enum: ['Bachelor', 'Master', 'PhD', 'Other']
    },
    institution: String,
    yearOfCompletion: Number,
    certifications: [String]
  },
  // Teaching Information
  createdCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    studentsEnrolled: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft'
    }
  }],
  teachingAreas: [String], // Array of subject areas they teach
  languagesSpoken: [String],
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  dateOfBirth: Date,
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  // Professional Details
  currentInstitution: {
    name: String,
    position: String,
    startDate: Date,
    website: String
  },
  previousExperience: [{
    institution: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  // Teaching Statistics
  teachingStats: {
    totalStudents: {
      type: Number,
      default: 0
    },
    totalCourses: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  },
  // Content Creation
  contentPreferences: {
    primaryTeachingStyle: {
      type: String,
      enum: ['Lecture-based', 'Interactive', 'Project-based', 'Discussion-based', 'Mixed']
    },
    difficultyLevels: [{
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced']
    }],
    contentTypes: [{
      type: String,
      enum: ['Video', 'Text', 'Interactive', 'Quiz', 'Assignment', 'Project']
    }]
  },
  // Social and Professional Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    youtube: String,
    personalWebsite: String,
    researchGate: String,
    orcid: String
  },
  // Verification and Status
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: String,
    documentType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  }],
  // Activity Tracking
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Reviews and Ratings
  reviews: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Achievements and Badges
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String,
    category: {
      type: String,
      enum: ['Teaching', 'Content', 'Student Engagement', 'Innovation', 'Leadership']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
instructorSchema.index({ email: 1 });
instructorSchema.index({ instructorId: 1 });
instructorSchema.index({ specialization: 1 });
instructorSchema.index({ 'teachingStats.averageRating': -1 });
instructorSchema.index({ createdAt: -1 });

// Virtual for full name
instructorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for total published courses
instructorSchema.virtual('publishedCoursesCount').get(function() {
  return this.createdCourses.filter(course => course.status === 'Published').length;
});

// Virtual for average course rating
instructorSchema.virtual('averageCourseRating').get(function() {
  const publishedCourses = this.createdCourses.filter(course => course.status === 'Published');
  if (publishedCourses.length === 0) return 0;
  
  const totalRating = publishedCourses.reduce((sum, course) => sum + course.averageRating, 0);
  return (totalRating / publishedCourses.length).toFixed(2);
});

// Virtual for years of experience
instructorSchema.virtual('yearsOfExperience').get(function() {
  if (!this.currentInstitution.startDate) return 0;
  
  const years = (new Date() - this.currentInstitution.startDate) / (1000 * 60 * 60 * 24 * 365);
  return Math.floor(years);
});

// Pre-save middleware to hash password
instructorSchema.pre('save', async function(next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to generate instructor ID
instructorSchema.pre('save', async function(next) {
  if (!this.instructorId && this.isNew) {
    const count = await this.constructor.countDocuments();
    this.instructorId = `INS${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to update teaching stats
instructorSchema.pre('save', function(next) {
  if (this.isModified('createdCourses')) {
    this.teachingStats.totalCourses = this.createdCourses.length;
    
    // Calculate total students
    this.teachingStats.totalStudents = this.createdCourses.reduce(
      (total, course) => total + course.studentsEnrolled, 0
    );
    
    // Calculate average rating
    const publishedCourses = this.createdCourses.filter(course => course.status === 'Published');
    if (publishedCourses.length > 0) {
      const totalRating = publishedCourses.reduce((sum, course) => sum + course.averageRating, 0);
      this.teachingStats.averageRating = totalRating / publishedCourses.length;
    }
  }
  next();
});

// Instance method to check password
instructorSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to update last login
instructorSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to add a new course
instructorSchema.methods.addCourse = function(courseId) {
  this.createdCourses.push({ courseId });
  return this.save();
};

// Instance method to update course statistics
instructorSchema.methods.updateCourseStats = function(courseId, stats) {
  const course = this.createdCourses.id(courseId);
  if (course) {
    Object.assign(course, stats);
    return this.save();
  }
  throw new Error('Course not found');
};

// Instance method to add review
instructorSchema.methods.addReview = function(reviewData) {
  this.reviews.push(reviewData);
  
  // Recalculate average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.teachingStats.averageRating = totalRating / this.reviews.length;
  this.teachingStats.totalReviews = this.reviews.length;
  
  return this.save();
};

// Static method to find by email
instructorSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get top instructors
instructorSchema.statics.getTopInstructors = function(limit = 10) {
  return this.find({ isActive: true, isVerified: true })
    .sort({ 'teachingStats.averageRating': -1, 'teachingStats.totalStudents': -1 })
    .limit(limit)
    .select('firstName lastName profilePicture specialization teachingStats bio');
};

// Static method to get instructor analytics
instructorSchema.statics.getInstructorAnalytics = async function(instructorId) {
  const instructor = await this.findById(instructorId)
    .populate('createdCourses.courseId', 'title studentsEnrolled rating difficulty')
    .select('teachingStats createdCourses reviews');
  
  if (!instructor) return null;
  
  const monthlyData = []; // TODO: Implement monthly analytics
  
  return {
    totalCourses: instructor.teachingStats.totalCourses,
    totalStudents: instructor.teachingStats.totalStudents,
    averageRating: instructor.teachingStats.averageRating,
    totalReviews: instructor.teachingStats.totalReviews,
    totalEarnings: instructor.teachingStats.totalEarnings,
    publishedCourses: instructor.publishedCoursesCount,
    monthlyData
  };
};

// Static method to search instructors
instructorSchema.statics.searchInstructors = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    $or: [
      { firstName: { $regex: query, $options: 'i' } },
      { lastName: { $regex: query, $options: 'i' } },
      { specialization: { $regex: query, $options: 'i' } },
      { teachingAreas: { $in: [new RegExp(query, 'i')] } }
    ]
  };
  
  // Apply filters
  if (filters.specialization) {
    searchQuery.specialization = { $regex: filters.specialization, $options: 'i' };
  }
  
  if (filters.experience) {
    searchQuery.experience = filters.experience;
  }
  
  if (filters.minRating) {
    searchQuery['teachingStats.averageRating'] = { $gte: filters.minRating };
  }
  
  return this.find(searchQuery)
    .sort({ 'teachingStats.averageRating': -1 })
    .select('firstName lastName profilePicture specialization teachingStats bio experience');
};

module.exports = mongoose.model('Instructor', instructorSchema);