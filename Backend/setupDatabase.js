const mongoose = require('mongoose');

// Connect to users database
async function initializeUsersDatabase() {
    try {
        console.log('🔍 Initializing Users Database...');
        
        // Connect to users database
        await mongoose.connect('mongodb://localhost:27017/learnpath-users');
        console.log('✅ Connected to learnpath-users database');
        
        // User Schema - same as workingAuthServer.js
        const UserSchema = new mongoose.Schema({
            firstName: {
                type: String,
                required: true,
                trim: true
            },
            lastName: {
                type: String,
                required: true,
                trim: true
            },
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true
            },
            password: {
                type: String,
                required: true,
                minlength: 6
            },
            role: {
                type: String,
                required: true,
                enum: ['student', 'instructor']
            },
            // Optional fields
            institution: String,
            department: String,
            experience: String,
            specialization: String,
            
            // Status fields
            isActive: {
                type: Boolean,
                default: true
            },
            lastLoginAt: {
                type: Date,
                default: Date.now
            }
        }, {
            timestamps: true
        });

        const User = mongoose.model('User', UserSchema);
        
        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Existing collections:', collections.map(c => c.name));
        
        // Count existing users
        const userCount = await User.countDocuments();
        console.log(`👥 Total users in database: ${userCount}`);
        
        if (userCount === 0) {
            console.log('🔧 Creating demo users...');
            
            // Create demo student
            const demoStudent = new User({
                firstName: 'Demo',
                lastName: 'Student',
                email: 'student@demo.com',
                password: '123456', // Will be hashed by pre-save middleware
                role: 'student',
                institution: 'Demo University'
            });
            await demoStudent.save();
            console.log('✅ Demo student created');
            
            // Create demo instructor
            const demoInstructor = new User({
                firstName: 'Demo',
                lastName: 'Instructor',
                email: 'instructor@demo.com',
                password: '123456', // Will be hashed by pre-save middleware
                role: 'instructor',
                department: 'Computer Science',
                experience: '5-10 years',
                specialization: 'Web Development'
            });
            await demoInstructor.save();
            console.log('✅ Demo instructor created');
            
            console.log('📊 Database initialized with demo data');
        } else {
            console.log('📊 Database already has users');
        }
        
        // List all users (without passwords)
        const allUsers = await User.find({}).select('-password');
        console.log('👥 Current users:');
        allUsers.forEach(user => {
            console.log(`   - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
        });
        
        // Show database stats
        const studentCount = await User.countDocuments({role: 'student'});
        const instructorCount = await User.countDocuments({role: 'instructor'});
        
        console.log('\n📈 Database Statistics:');
        console.log(`   📚 Students: ${studentCount}`);
        console.log(`   👨‍🏫 Instructors: ${instructorCount}`);
        console.log(`   📊 Total Users: ${userCount + 2}`); // +2 for demo users if created
        
        await mongoose.connection.close();
        console.log('🔐 Database connection closed');
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

// Run the initialization
initializeUsersDatabase();