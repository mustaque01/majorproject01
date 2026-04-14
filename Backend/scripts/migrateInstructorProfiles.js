/**
 * Instructor Profile Migration Script
 * Creates missing Instructor profiles for existing instructor users
 * Run this once to migrate any instructors who signed up before the fix
 */

const mongoose = require('mongoose');
const User = require('../models/UserReal');
const Instructor = require('../models/Instructor');

const migrateInstructorProfiles = async () => {
    try {
        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState === 0) {
            const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-platform';
            await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ MongoDB connected');
        }

        console.log('\n🔍 Starting Instructor Profile Migration...\n');

        // Find all instructor users
        const instructorUsers = await User.find({ role: 'instructor' });
        console.log(`📊 Found ${instructorUsers.length} instructor users`);

        if (instructorUsers.length === 0) {
            console.log('ℹ️  No instructors found to migrate');
            process.exit(0);
        }

        let created = 0;
        let skipped = 0;
        let errors = 0;

        // Check each instructor user
        for (const user of instructorUsers) {
            try {
                // Check if instructor profile already exists
                const existingInstructor = await Instructor.findOne({ userId: user._id });

                if (existingInstructor) {
                    console.log(`⏭️  Skipped: ${user.email} (profile already exists)`);
                    skipped++;
                    continue;
                }

                // Create instructor profile
                const instructorData = {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    userId: user._id,
                    specialization: user.specialization || 'General',
                    yearsOfExperience: 0,
                    isActive: user.isActive,
                    isVerified: false,
                    bio: `${user.firstName} ${user.lastName} - Verified Instructor`,
                    certifications: [],
                    skills: [],
                    profileImage: null,
                    socialLinks: {
                        linkedin: '',
                        github: '',
                        twitter: '',
                        website: ''
                    },
                    totalStudents: 0,
                    averageRating: 0,
                    coursesCreated: 0
                };

                const newInstructor = new Instructor(instructorData);
                await newInstructor.save();

                console.log(`✅ Created: ${user.email}`);
                created++;

            } catch (error) {
                console.error(`❌ Error for ${user.email}:`, error.message);
                errors++;
            }
        }

        // Summary
        console.log('\n📈 Migration Summary:');
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📊 Total: ${created + skipped + errors}\n`);

        if (errors === 0) {
            console.log('🎉 Migration completed successfully!');
        } else {
            console.log('⚠️  Migration completed with some errors');
        }

        process.exit(0);

    } catch (error) {
        console.error('❌ Fatal migration error:', error);
        process.exit(1);
    }
};

// Run migration if this is the main module
if (require.main === module) {
    migrateInstructorProfiles();
}

module.exports = migrateInstructorProfiles;
