const mongoose = require('mongoose');

// Import models to ensure they're registered
const Student = require('../server/models/Student');
const Instructor = require('../server/models/Instructor');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/learning-path-dashboard', {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    minPoolSize: 5,
    maxIdleTimeMS: 30000,
})
.then(() => {
    console.log('✅ Connected to MongoDB');
    return initializeDatabase();
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

async function initializeDatabase() {
    try {
        console.log('🔍 Checking database collections...');
        
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📋 Existing collections:', collections.map(c => c.name));
        
        // Check if collections exist first
        const hasStudentsCollection = collections.some(c => c.name === 'students');
        const hasInstructorsCollection = collections.some(c => c.name === 'instructors');
        
        let studentCount = 0;
        let instructorCount = 0;
        
        if (hasStudentsCollection) {
            studentCount = await Student.countDocuments();
            console.log(`👨‍🎓 Students collection: ${studentCount} documents`);
        } else {
            console.log(`👨‍🎓 Students collection: Not created yet`);
        }
        
        if (hasInstructorsCollection) {
            instructorCount = await Instructor.countDocuments();
            console.log(`👨‍🏫 Instructors collection: ${instructorCount} documents`);
        } else {
            console.log(`👨‍🏫 Instructors collection: Not created yet`);
        }
        
        // Test creating a sample student (if none exist)
        if (studentCount === 0) {
            console.log('🔧 Creating sample student to test schema...');
            const testStudent = new Student({
                firstName: 'Test',
                lastName: 'Student',
                email: 'test.student@example.com',
                password: 'testpassword123',
                institution: 'Test University'
            });
            
            // Validate without saving
            await testStudent.validate();
            console.log('✅ Student schema validation passed');
            
            // Save test student to initialize collection
            await testStudent.save();
            console.log('✅ Test student created successfully');
        }
        
        // Test creating a sample instructor (if none exist)
        if (instructorCount === 0) {
            console.log('🔧 Creating sample instructor to test schema...');
            const testInstructor = new Instructor({
                firstName: 'Test',
                lastName: 'Instructor',
                email: 'test.instructor@example.com',
                password: 'testpassword123',
                department: 'Computer Science',
                experience: '5-10 years',
                specialization: 'Web Development'
            });
            
            // Validate without saving
            await testInstructor.validate();
            console.log('✅ Instructor schema validation passed');
            
            // Save test instructor to initialize collection
            await testInstructor.save();
            console.log('✅ Test instructor created successfully');
        }
        
        // Show indexes for both collections
        console.log('\n📊 Collection Indexes:');
        
        try {
            const studentIndexes = await Student.collection.getIndexes();
            console.log('👨‍🎓 Student indexes:', Object.keys(studentIndexes));
        } catch (error) {
            console.log('👨‍🎓 Student collection not yet created');
        }
        
        try {
            const instructorIndexes = await Instructor.collection.getIndexes();
            console.log('👨‍🏫 Instructor indexes:', Object.keys(instructorIndexes));
        } catch (error) {
            console.log('👨‍🏫 Instructor collection not yet created');
        }
        
        console.log('\n✅ Database initialization check completed');
        
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        console.error('Error details:', error.message);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔐 Database connection closed');
        process.exit(0);
    }
}