const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
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
    default: 'student',
    enum: ['student']
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
    maxlength: [100, 'Institution name cannot exceed 100 characters']
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values while maintaining uniqueness
    trim: true
  },
  // Learning Progress
  enrolledCourses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  learningPaths: [{
    pathId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningPath'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  // Profile Information
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
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
  // Academic Information
  academicLevel: {
    type: String,
    enum: ['High School', 'Undergraduate', 'Graduate', 'PhD', 'Other']
  },
  major: {
    type: String,
    trim: true
  },
  graduationYear: Number,
  // Learning Preferences
  learningPreferences: {
    preferredLearningStyle: {
      type: String,
      enum: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing']
    },
    difficultyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    interests: [String],
    goals: [String]
  },
  // Activity Tracking
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  totalStudyTime: {
    type: Number,
    default: 0 // in minutes
  },
  streakDays: {
    type: Number,
    default: 0
  },
  achievements: [{
    title: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
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
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance (email and studentId already indexed due to unique: true)
studentSchema.index({ 'enrolledCourses.courseId': 1 });
studentSchema.index({ createdAt: -1 });

// Virtual for full name
studentSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for completed courses count
studentSchema.virtual('completedCoursesCount').get(function() {
  return this.enrolledCourses.filter(course => course.completed).length;
});

// Virtual for total enrolled courses
studentSchema.virtual('totalEnrolledCourses').get(function() {
  return this.enrolledCourses.length;
});

// Pre-save middleware to hash password
studentSchema.pre('save', async function(next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', async function(next) {
  if (!this.studentId && this.isNew) {
    const count = await this.constructor.countDocuments();
    this.studentId = `STU${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Instance method to check password
studentSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to update last login
studentSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to calculate overall progress
studentSchema.methods.calculateOverallProgress = function() {
  if (this.enrolledCourses.length === 0) return 0;
  
  const totalProgress = this.enrolledCourses.reduce((sum, course) => sum + course.progress, 0);
  return Math.round(totalProgress / this.enrolledCourses.length);
};

// Instance method to add study time
studentSchema.methods.addStudyTime = function(minutes) {
  this.totalStudyTime += minutes;
  return this.save({ validateBeforeSave: false });
};

// Instance method to enroll in course
studentSchema.methods.enrollInCourse = function(courseId) {
  const alreadyEnrolled = this.enrolledCourses.some(
    course => course.courseId.toString() === courseId.toString()
  );
  
  if (!alreadyEnrolled) {
    this.enrolledCourses.push({ courseId });
    return this.save();
  }
  
  throw new Error('Already enrolled in this course');
};

// Static method to find by email
studentSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get learning statistics
studentSchema.statics.getLearningStats = async function(studentId) {
  const student = await this.findById(studentId)
    .populate('enrolledCourses.courseId', 'title duration difficulty')
    .populate('learningPaths.pathId', 'title estimatedDuration');
  
  if (!student) return null;
  
  return {
    totalCourses: student.enrolledCourses.length,
    completedCourses: student.completedCoursesCount,
    totalStudyTime: student.totalStudyTime,
    overallProgress: student.calculateOverallProgress(),
    streakDays: student.streakDays,
    achievements: student.achievements.length
  };
};

module.exports = mongoose.model('Student', studentSchema);