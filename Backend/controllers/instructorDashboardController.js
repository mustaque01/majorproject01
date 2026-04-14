/**
 * Instructor Dashboard Controller
 * Handle comprehensive dashboard data, analytics, and statistics
 */

const Instructor = require('../models/Instructor');
const Course = require('../models/Course');
const User = require('../models/UserReal');

/**
 * GET Complete Instructor Dashboard
 * Provides all dashboard data in one call
 */
const getDashboard = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get instructor profile
        const instructor = await Instructor.findOne({ userId }).lean();

        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Get all courses
        const allCourses = await Course.find({ instructorId: instructor._id }).lean();

        // Calculate dashboard statistics
        const activeCourses = allCourses.filter(c => c.status === 'active');
        const draftCourses = allCourses.filter(c => c.status === 'draft');
        const totalStudents = allCourses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);
        const totalRevenue = activeCourses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrolledStudents || 0)), 0);
        const totalRatings = activeCourses.filter(c => c.rating > 0).length;
        const avgRating = activeCourses.length > 0 
            ? (activeCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / activeCourses.length).toFixed(2)
            : 0;

        // Top performing courses
        const topCourses = allCourses
            .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
            .slice(0, 5)
            .map(c => ({
                _id: c._id,
                title: c.title,
                students: c.enrolledStudents,
                rating: c.rating,
                price: c.price,
                status: c.status
            }));

        // Courses by category
        const coursesByCategory = {};
        for (const course of allCourses) {
            const catId = course.categoryId.toString();
            if (!coursesByCategory[catId]) {
                coursesByCategory[catId] = { count: 0, students: 0 };
            }
            coursesByCategory[catId].count += 1;
            coursesByCategory[catId].students += course.enrolledStudents || 0;
        }

        // Recent activity (courses created in last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentCourses = allCourses
            .filter(c => new Date(c.createdAt) > thirtyDaysAgo)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        const dashboard = {
            instructor: {
                _id: instructor._id,
                name: instructor.name,
                email: instructor.email,
                specialization: instructor.specialization,
                yearsOfExperience: instructor.yearsOfExperience,
                profileImage: instructor.profileImage,
                isVerified: instructor.isVerified
            },
            statistics: {
                totalCourses: allCourses.length,
                activeCourses: activeCourses.length,
                draftCourses: draftCourses.length,
                totalStudents: totalStudents,
                totalRevenue: totalRevenue.toFixed(2),
                averageRating: parseFloat(avgRating),
                ratedCourses: totalRatings
            },
            courseBreakdown: {
                byStatus: {
                    active: activeCourses.length,
                    draft: draftCourses.length
                },
                byLevel: {
                    Beginner: allCourses.filter(c => c.level === 'Beginner').length,
                    Intermediate: allCourses.filter(c => c.level === 'Intermediate').length,
                    Advanced: allCourses.filter(c => c.level === 'Advanced').length
                }
            },
            topCourses: topCourses,
            coursesByCategory: coursesByCategory,
            recentActivity: {
                coursesCreatedLastMonth: recentCourses.length,
                studentsAddedLastMonth: recentCourses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0)
            }
        };

        res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};

/**
 * GET Course Detailed Analytics
 */
const getCourseAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        // Get instructor
        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Get course
        const course = await Course.findById(courseId).lean();
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Verify ownership
        if (course.instructorId.toString() !== instructor._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only view analytics for your own courses'
            });
        }

        const analytics = {
            course: {
                _id: course._id,
                title: course.title,
                status: course.status,
                level: course.level
            },
            performance: {
                enrolledStudents: course.enrolledStudents || 0,
                completionRate: course.completionRate || 0,
                averageRating: course.rating || 0,
                totalReviews: course.reviews?.length || 0,
                price: course.price,
                revenue: ((course.price || 0) * (course.enrolledStudents || 0)).toFixed(2)
            },
            metadata: {
                duration: course.duration,
                difficulty: course.difficulty,
                skills: course.skills,
                requirements: course.requirements,
                prerequisites: course.prerequisites,
                certification: course.certification
            },
            content: {
                topics: course.topics?.length || 0,
                resources: course.resources?.length || 0,
                lastUpdated: course.updatedAt
            }
        };

        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching course analytics',
            error: error.message
        });
    }
};

/**
 * GET Instructor Performance Summary
 */
const getPerformanceSummary = async (req, res) => {
    try {
        const userId = req.user._id;

        const instructor = await Instructor.findOne({ userId }).lean();
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        const courses = await Course.find({ instructorId: instructor._id }).lean();

        // Calculate performance metrics
        const activeCourses = courses.filter(c => c.status === 'active');
        const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);
        const totalRevenue = activeCourses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrolledStudents || 0)), 0);
        const avgCompletionRate = activeCourses.length > 0
            ? (activeCourses.reduce((sum, c) => sum + (c.completionRate || 0), 0) / activeCourses.length).toFixed(2)
            : 0;

        // Growth metrics
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newStudentsLast30Days = courses
            .filter(c => new Date(c.createdAt) > thirtyDaysAgo)
            .reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);

        const summary = {
            instructor: {
                name: instructor.name,
                specialization: instructor.specialization,
                yearsOfExperience: instructor.yearsOfExperience,
                isVerified: instructor.isVerified
            },
            keyMetrics: {
                activeCourses: activeCourses.length,
                totalCourses: courses.length,
                totalStudents: totalStudents,
                averageRating: instructor.averageRating,
                totalRevenue: totalRevenue.toFixed(2)
            },
            performance: {
                averageCompletionRate: parseFloat(avgCompletionRate),
                studentGrowthLast30Days: newStudentsLast30Days,
                courseUpdateFrequency: 'Last 30 days'
            },
            trend: {
                upward: activeCourses.length > 0 ? '✓' : '✗',
                recommendation: activeCourses.length > 0 
                    ? 'Focus on engagement and updating course materials'
                    : 'Publish more courses to increase reach'
            }
        };

        res.status(200).json({
            success: true,
            data: summary
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching performance summary',
            error: error.message
        });
    }
};

/**
 * GET Earnings Report
 */
const getEarningsReport = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'monthly' } = req.query; // daily, weekly, monthly, yearly

        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        const courses = await Course.find({ instructorId: instructor._id, status: 'active' }).lean();

        // Calculate earnings
        let startDate;
        const now = new Date();

        switch(period) {
            case 'daily':
                startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'yearly':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const periodCourses = courses.filter(c => new Date(c.createdAt) >= startDate);
        const earnings = periodCourses.reduce((sum, c) => {
            return sum + ((c.price || 0) * (c.enrolledStudents || 0));
        }, 0);

        const report = {
            period: period,
            dateRange: {
                from: startDate,
                to: now
            },
            earnings: {
                gross: earnings.toFixed(2),
                net: (earnings * 0.9).toFixed(2), // 10% platform fee
                platformFee: (earnings * 0.1).toFixed(2)
            },
            courses: {
                count: periodCourses.length,
                topEarner: periodCourses.length > 0
                    ? periodCourses
                        .map(c => ({
                            title: c.title,
                            revenue: ((c.price || 0) * (c.enrolledStudents || 0)).toFixed(2),
                            students: c.enrolledStudents
                        }))
                        .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))[0]
                    : null
            }
        };

        res.status(200).json({
            success: true,
            data: report
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating earnings report',
            error: error.message
        });
    }
};

/**
 * GET Instructor Reviews
 */
const getReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, courseId } = req.query;

        const instructor = await Instructor.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({
                success: false,
                message: 'Instructor profile not found'
            });
        }

        // Get all instructor courses
        let courseFilter = { instructorId: instructor._id };
        if (courseId) {
            courseFilter._id = courseId;
        }

        const courses = await Course.find(courseFilter)
            .select('reviews title')
            .lean();

        // Aggregate all reviews from courses
        let allReviews = [];
        courses.forEach(course => {
            if (course.reviews && course.reviews.length > 0) {
                course.reviews.forEach(review => {
                    allReviews.push({
                        courseTitle: course.title,
                        courseId: course._id,
                        ...review
                    });
                });
            }
        });

        // Sort by date (most recent first)
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedReviews = allReviews.slice(skip, skip + parseInt(limit));

        // Statistics
        const avgRating = allReviews.length > 0
            ? (allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length).toFixed(2)
            : 0;

        const ratingDistribution = {
            5: allReviews.filter(r => r.rating === 5).length,
            4: allReviews.filter(r => r.rating === 4).length,
            3: allReviews.filter(r => r.rating === 3).length,
            2: allReviews.filter(r => r.rating === 2).length,
            1: allReviews.filter(r => r.rating === 1).length
        };

        res.status(200).json({
            success: true,
            data: paginatedReviews,
            statistics: {
                totalReviews: allReviews.length,
                averageRating: parseFloat(avgRating),
                ratingDistribution
            },
            pagination: {
                current: parseInt(page),
                limit: parseInt(limit),
                total: allReviews.length,
                pages: Math.ceil(allReviews.length / parseInt(limit))
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

module.exports = {
    getDashboard,
    getCourseAnalytics,
    getPerformanceSummary,
    getEarningsReport,
    getReviews
};
