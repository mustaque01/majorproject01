import React, { useState } from 'react';

const Signup = ({ onSwitchToLogin, onSignup, isLoading: authLoading, error: authError, onClearError }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    // Additional fields based on role
    institution: '', // For students
    department: '', // For instructors
    experience: '', // For instructors
    specialization: '' // For instructors
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear specific error when user types
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    // Clear auth error when user types
    if (authError && onClearError) {
      onClearError();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (formData.role === 'student' && !formData.institution.trim()) {
      newErrors.institution = 'Institution/School is required for students';
    }

    if (formData.role === 'instructor') {
      if (!formData.department.trim()) newErrors.department = 'Department is required for instructors';
      if (!formData.experience.trim()) newErrors.experience = 'Experience level is required for instructors';
      if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required for instructors';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (onSignup) {
      onSignup(formData);
    }
  };

  const roles = [
    { value: 'student', label: 'Student', icon: 'fas fa-user-graduate', description: 'Learn and take courses' },
    { value: 'instructor', label: 'Instructor', icon: 'fas fa-chalkboard-teacher', description: 'Teach and create courses' }
  ];

  const experienceLevels = [
    'Less than 1 year',
    '1-3 years',
    '3-5 years',
    '5-10 years',
    'More than 10 years'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm mb-4">
            <i className="fas fa-user-plus text-white text-2xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join LearnPath</h1>
          <p className="text-purple-200">Start your learning journey today</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white border-opacity-20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${
                      formData.role === role.value
                        ? 'border-white bg-white bg-opacity-20 shadow-lg'
                        : 'border-white border-opacity-30 hover:border-opacity-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <i className={`${role.icon} text-white text-xl mb-2 block`}></i>
                      <div className="text-white font-medium text-sm">{role.label}</div>
                      <div className="text-purple-200 text-xs mt-1">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                    errors.firstName ? 'border-red-400' : 'border-white border-opacity-30'
                  }`}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-red-300 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                    errors.lastName ? 'border-red-400' : 'border-white border-opacity-30'
                  }`}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-red-300 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-purple-300"></i>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-400' : 'border-white border-opacity-30'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Role-specific Fields */}
            {formData.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">Institution/School</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-university text-purple-300"></i>
                  </div>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                      errors.institution ? 'border-red-400' : 'border-white border-opacity-30'
                    }`}
                    placeholder="Your school or university"
                  />
                </div>
                {errors.institution && <p className="text-red-300 text-xs mt-1">{errors.institution}</p>}
              </div>
            )}

            {formData.role === 'instructor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-building text-purple-300"></i>
                    </div>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                        errors.department ? 'border-red-400' : 'border-white border-opacity-30'
                      }`}
                      placeholder="Your department"
                    />
                  </div>
                  {errors.department && <p className="text-red-300 text-xs mt-1">{errors.department}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Experience</label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white bg-opacity-20 border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                        errors.experience ? 'border-red-400' : 'border-white border-opacity-30'
                      }`}
                    >
                      <option value="" className="text-gray-800">Select experience</option>
                      {experienceLevels.map((level) => (
                        <option key={level} value={level} className="text-gray-800">{level}</option>
                      ))}
                    </select>
                    {errors.experience && <p className="text-red-300 text-xs mt-1">{errors.experience}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Specialization</label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                        errors.specialization ? 'border-red-400' : 'border-white border-opacity-30'
                      }`}
                      placeholder="e.g., Computer Science"
                    />
                    {errors.specialization && <p className="text-red-300 text-xs mt-1">{errors.specialization}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-purple-300"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                      errors.password ? 'border-red-400' : 'border-white border-opacity-30'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-purple-300 hover:text-white transition-colors`}></i>
                  </button>
                </div>
                {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="fas fa-lock text-purple-300"></i>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border rounded-xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-400' : 'border-white border-opacity-30'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-purple-300 hover:text-white transition-colors`}></i>
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* General Error (from API) */}
            {authError && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-100 px-4 py-3 rounded-xl">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <span className="text-sm">{authError}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {authLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <i className="fas fa-user-plus mr-2"></i>
                  Create Account
                </div>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-purple-200 text-center">
              By creating an account, you agree to our{' '}
              <button className="underline hover:text-white transition-colors">Terms of Service</button>
              {' '}and{' '}
              <button className="underline hover:text-white transition-colors">Privacy Policy</button>
            </p>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-6 border-t border-white border-opacity-20 text-center">
            <p className="text-purple-200 text-sm">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-white font-semibold hover:text-purple-200 transition-colors duration-200"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-sm">
            Secure registration powered by LearnPath
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;