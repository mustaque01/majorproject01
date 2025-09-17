const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../server/models/Student');
const Instructor = require('../server/models/Instructor');

// Demo users data
const demoStudents = [
    {
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'student@demo.com',
        password: '123456',
        dateOfBirth: new Date('1999-05-15'),
        phoneNumber: '+91-9876543210',
        address: {
            street: '123 Student Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            zipCode: '400001'
        },
        preferences: {
            learningStyle: 'visual',
            notifications: {
                email: true,
                sms: false,
                push: true
            }
        },
        emergencyContact: {
            name: 'Priya Sharma',
            relationship: 'Mother',
            phoneNumber: '+91-9876543211'
        }
    },
    {
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.student@demo.com',
        password: '123456',
        dateOfBirth: new Date('2000-08-22'),
        phoneNumber: '+91-8765432109',
        address: {
            street: '456 Learning Lane',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            zipCode: '110001'
        },
        preferences: {
            learningStyle: 'auditory',
            notifications: {
                email: true,
                sms: true,
                push: true
            }
        },
        emergencyContact: {
            name: 'Amit Patel',
            relationship: 'Father',
            phoneNumber: '+91-8765432108'
        }
    }
];

const demoInstructors = [
    {
        firstName: 'Alakh',
        lastName: 'Panday',
        email: 'instructor@demo.com',
        password: '123456',
        dateOfBirth: new Date('1985-03-10'),
        phoneNumber: '+91-9988776655',
        address: {
            street: '789 Teacher Avenue',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            zipCode: '560001'
        },
        qualifications: [
            {
                degree: 'M.Tech',
                field: 'Computer Science',
                institution: 'IIT Delhi',
                year: 2010
            },
            {
                degree: 'B.Tech',
                field: 'Computer Engineering',
                institution: 'Delhi Technological University',
                year: 2008
            }
        ],
        specializations: ['Web Development', 'Data Structures', 'Algorithms', 'System Design'],
        experience: 12,
        bio: 'Passionate educator with 12+ years of experience in software development and teaching. Specializes in making complex concepts simple and engaging.',
        socialLinks: {
            linkedin: 'https://linkedin.com/in/alakhpanday',
            twitter: 'https://twitter.com/alakhpanday',
            github: 'https://github.com/alakhpanday'
        }
    },
    {
        firstName: 'Anuj',
        lastName: 'Bhaiya',
        email: 'anuj.instructor@demo.com',
        password: '123456',
        dateOfBirth: new Date('1988-07-18'),
        phoneNumber: '+91-8877665544',
        address: {
            street: '321 Mentor Street',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            zipCode: '411001'
        },
        qualifications: [
            {
                degree: 'MS',
                field: 'Computer Science',
                institution: 'Stanford University',
                year: 2012
            },
            {
                degree: 'B.E.',
                field: 'Information Technology',
                institution: 'Pune University',
                year: 2010
            }
        ],
        specializations: ['Machine Learning', 'Python', 'Data Science', 'AI'],
        experience: 10,
        bio: 'Former Google engineer turned educator. Loves teaching AI and ML concepts with real-world applications.',
        socialLinks: {
            linkedin: 'https://linkedin.com/in/anujbhaiya',
            youtube: 'https://youtube.com/anujbhaiya',
            github: 'https://github.com/anujbhaiya'
        }
    }
];

const seedDemoUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/learning-path-dashboard', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('📦 Connected to MongoDB for seeding demo users');

        // Clear existing demo users (optional - comment out if you want to keep existing users)
        // await Student.deleteMany({ email: { $regex: /@demo\.com$/ } });
        // await Instructor.deleteMany({ email: { $regex: /@demo\.com$/ } });
        // console.log('🧹 Cleared existing demo users');

        // Hash passwords and create demo students
        for (let studentData of demoStudents) {
            const existingStudent = await Student.findOne({ email: studentData.email });
            if (!existingStudent) {
                const hashedPassword = await bcrypt.hash(studentData.password, 12);
                studentData.password = hashedPassword;
                
                const student = new Student(studentData);
                await student.save();
                console.log(`👨‍🎓 Created demo student: ${studentData.firstName} ${studentData.lastName} (${studentData.email})`);
            } else {
                console.log(`👨‍🎓 Demo student already exists: ${studentData.email}`);
            }
        }

        // Hash passwords and create demo instructors
        for (let instructorData of demoInstructors) {
            const existingInstructor = await Instructor.findOne({ email: instructorData.email });
            if (!existingInstructor) {
                const hashedPassword = await bcrypt.hash(instructorData.password, 12);
                instructorData.password = hashedPassword;
                
                const instructor = new Instructor(instructorData);
                await instructor.save();
                console.log(`👨‍🏫 Created demo instructor: ${instructorData.firstName} ${instructorData.lastName} (${instructorData.email})`);
            } else {
                console.log(`👨‍🏫 Demo instructor already exists: ${instructorData.email}`);
            }
        }

        console.log('\n🎉 Demo users seeded successfully!');
        console.log('\n📋 Demo Login Credentials:');
        console.log('================================');
        console.log('🎓 STUDENTS:');
        console.log('Email: student@demo.com');
        console.log('Password: 123456');
        console.log('');
        console.log('Email: priya.student@demo.com');
        console.log('Password: 123456');
        console.log('');
        console.log('👨‍🏫 INSTRUCTORS:');
        console.log('Email: instructor@demo.com');
        console.log('Password: 123456');
        console.log('');
        console.log('Email: anuj.instructor@demo.com');
        console.log('Password: 123456');
        console.log('================================');
        
    } catch (error) {
        console.error('❌ Error seeding demo users:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

module.exports = seedDemoUsers;

// Run seeder if this file is executed directly
if (require.main === module) {
    seedDemoUsers();
}