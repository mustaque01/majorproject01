/**
 * Database Seeding Script
 * Seeds the database with instructors, categories, and courses
 */

const mongoose = require('mongoose');
const Instructor = require('../models/Instructor');
const Category = require('../models/Category');
const Course = require('../models/Course');
const UserReal = require('../models/UserReal');

const instructorsData = require('./instructors');
const categoriesData = require('./enhancedCategories');
const coursesData = require('./enhancedCourses');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            // Connection string should come from environment variables
            const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform';
            await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('MongoDB connected');
        }

        // Clear existing data
        console.log('Clearing existing data...');
        await Instructor.deleteMany({});
        await Category.deleteMany({});
        await Course.deleteMany({});
        console.log('Existing data cleared');

        // Create instructor users first
        console.log('Creating instructor users...');
        const instructorUsers = [];
        for (let i = 0; i < instructorsData.length; i++) {
            const instructor = instructorsData[i];
            const user = await UserReal.create({
                firstName: instructor.name.split(' ')[0],
                lastName: instructor.name.split(' ').slice(1).join(' '),
                email: instructor.email,
                password: 'TemporaryPassword123!', // Should be hashed in real scenario
                role: 'instructor',
                permissions: ['read:courses', 'write:courses', 'read:students', 'read:profile', 'write:profile'],
                isActive: true,
                isEmailVerified: true
            });
            instructorUsers.push(user);
        }
        console.log(`${instructorUsers.length} instructor users created`);

        // Seed Instructors
        console.log('Seeding instructors...');
        const instructorsWithUsers = instructorsData.map((instructor, index) => ({
            ...instructor,
            userId: instructorUsers[index]._id
        }));
        const createdInstructors = await Instructor.insertMany(instructorsWithUsers);
        console.log(`${createdInstructors.length} instructors seeded`);

        // Seed Categories
        console.log('Seeding categories...');
        const createdCategories = await Category.insertMany(categoriesData);
        console.log(`${createdCategories.length} categories seeded`);

        // Create mapping of instructor IDs and category IDs for courses
        const instructorMap = {};
        createdInstructors.forEach((instructor) => {
            instructorMap[instructor.id] = instructor._id;
        });

        const categoryMap = {};
        createdCategories.forEach((category) => {
            categoryMap[category.id] = category._id;
        });

        // Prepare courses with proper references
        console.log('Preparing courses with references...');
        const coursesWithReferences = coursesData.map(course => {
            const courseObj = { ...course };
            courseObj.instructorId = instructorMap[course.instructorId];
            courseObj.categoryId = categoryMap[course.categoryId];

            // Update prerequisites with proper IDs (these will be updated after courses are created)
            if (courseObj.prerequisites && courseObj.prerequisites.length > 0) {
                courseObj.prerequisites = courseObj.prerequisites.map(prereq => ({
                    ...prereq,
                    courseId: null // Will be updated after all courses are created
                }));
            }

            return courseObj;
        });

        // Seed Courses (first pass - without prerequisites)
        console.log('Seeding courses (first pass)...');
        const createdCourses = await Course.insertMany(coursesWithReferences);
        console.log(`${createdCourses.length} courses seeded`);

        // Create course mapping by original ID
        const courseMap = {};
        createdCourses.forEach(course => {
            courseMap[course.id] = course._id;
        });

        // Update prerequisites with actual MongoDB IDs
        console.log('Updating course prerequisites...');
        for (let i = 0; i < coursesData.length; i++) {
            const originalCourse = coursesData[i];
            if (originalCourse.prerequisites && originalCourse.prerequisites.length > 0) {
                const updatedPrerequisites = originalCourse.prerequisites.map(prereq => ({
                    courseId: courseMap[prereq.courseId],
                    courseName: prereq.courseName
                }));

                await Course.updateOne(
                    { id: originalCourse.id },
                    { prerequisites: updatedPrerequisites }
                );
            }
        }
        console.log('Course prerequisites updated');

        // Verify seeding
        console.log('\n=== Seeding Summary ===');
        const instructorCount = await Instructor.countDocuments();
        const categoryCount = await Category.countDocuments();
        const courseCount = await Course.countDocuments();

        console.log(`✓ Instructors: ${instructorCount}`);
        console.log(`✓ Categories: ${categoryCount}`);
        console.log(`✓ Courses: ${courseCount}`);

        // Sample data verification
        console.log('\n=== Sample Data ===');
        const sampleCategory = await Category.findOne();
        const sampleInstructor = await Instructor.findOne();
        const sampleCourse = await Course.findOne().populate('instructorId categoryId');

        console.log('Sample Category:', {
            name: sampleCategory.name,
            trending: sampleCategory.trending,
            totalCourses: sampleCategory.totalCourses
        });

        console.log('Sample Instructor:', {
            name: sampleInstructor.name,
            specialization: sampleInstructor.specialization,
            yearsOfExperience: sampleInstructor.yearsOfExperience
        });

        console.log('Sample Course:', {
            title: sampleCourse.title,
            level: sampleCourse.level,
            instructor: sampleCourse.instructor,
            difficulty: sampleCourse.difficulty,
            hasPrerequisites: sampleCourse.prerequisites.length > 0
        });

        console.log('\n✅ Database seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeding function
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
