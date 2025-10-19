/**
 * REAL AUTHENTICATION TESTING SCRIPT
 * Tests actual user registration and login without mock data
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5002/api/auth';

// Test data for real users
const testUsers = [
    {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@university.edu',
        password: 'securepassword123',
        role: 'student',
        institution: 'MIT'
    },
    {
        firstName: 'Dr. Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@university.edu',
        password: 'instructorpass456',
        role: 'instructor',
        department: 'Computer Science',
        experience: '10+ years teaching programming',
        specialization: 'Machine Learning and AI'
    }
];

async function testAuthentication() {
    console.log('🧪 TESTING REAL USER AUTHENTICATION');
    console.log('═══════════════════════════════════════\n');

    try {
        // Test 1: Server Health Check
        console.log('1️⃣ Testing server health...');
        const healthResponse = await axios.get('http://localhost:5002/health');
        console.log('✅ Server is healthy:', healthResponse.data.message);
        console.log(`   Database: ${healthResponse.data.database}\n`);

        // Test 2: User Registration
        console.log('2️⃣ Testing user registration...');
        
        for (const userData of testUsers) {
            try {
                const registerResponse = await axios.post(`${API_BASE_URL}/register`, userData);
                console.log(`✅ Registered ${userData.role}: ${userData.email}`);
                console.log(`   User ID: ${registerResponse.data.data.user.id}`);
                console.log(`   Token received: ${registerResponse.data.data.accessToken ? 'Yes' : 'No'}\n`);
            } catch (error) {
                if (error.response?.status === 409) {
                    console.log(`ℹ️ User already exists: ${userData.email}\n`);
                } else {
                    console.log(`❌ Registration failed for ${userData.email}:`, error.response?.data?.message || error.message);
                }
            }
        }

        // Test 3: User Login
        console.log('3️⃣ Testing user login...');
        
        const loginTests = [
            {
                email: testUsers[0].email,
                password: testUsers[0].password,
                role: testUsers[0].role
            },
            {
                email: testUsers[1].email,
                password: testUsers[1].password,
                role: testUsers[1].role
            }
        ];

        let studentToken = '';
        let instructorToken = '';

        for (const loginData of loginTests) {
            try {
                const loginResponse = await axios.post(`${API_BASE_URL}/login`, loginData);
                console.log(`✅ Login successful for ${loginData.role}: ${loginData.email}`);
                console.log(`   Welcome: ${loginResponse.data.data.user.firstName} ${loginResponse.data.data.user.lastName}`);
                console.log(`   Permissions: ${loginResponse.data.data.user.permissions.join(', ')}`);
                
                // Store tokens for further testing
                if (loginData.role === 'student') {
                    studentToken = loginResponse.data.data.accessToken;
                } else if (loginData.role === 'instructor') {
                    instructorToken = loginResponse.data.data.accessToken;
                }
                console.log('');
            } catch (error) {
                console.log(`❌ Login failed for ${loginData.email}:`, error.response?.data?.message || error.message);
            }
        }

        // Test 4: Protected Route Access
        console.log('4️⃣ Testing protected routes...');
        
        if (studentToken) {
            try {
                const profileResponse = await axios.get(`${API_BASE_URL}/me`, {
                    headers: { Authorization: `Bearer ${studentToken}` }
                });
                console.log('✅ Student can access profile:', profileResponse.data.data.user.email);
            } catch (error) {
                console.log('❌ Student profile access failed:', error.response?.data?.message);
            }
        }

        if (instructorToken) {
            try {
                const studentsResponse = await axios.get(`${API_BASE_URL}/students`, {
                    headers: { Authorization: `Bearer ${instructorToken}` }
                });
                console.log(`✅ Instructor can view students: ${studentsResponse.data.data.count} students found`);
            } catch (error) {
                console.log('❌ Instructor students access failed:', error.response?.data?.message);
            }
        }

        // Test 5: Authorization Testing
        console.log('\n5️⃣ Testing authorization restrictions...');
        
        if (studentToken) {
            try {
                await axios.get(`${API_BASE_URL}/users`, {
                    headers: { Authorization: `Bearer ${studentToken}` }
                });
                console.log('❌ Security Issue: Student accessed admin endpoint!');
            } catch (error) {
                if (error.response?.status === 403) {
                    console.log('✅ Authorization working: Student blocked from admin endpoint');
                } else {
                    console.log('⚠️ Unexpected error:', error.response?.data?.message);
                }
            }
        }

        // Test 6: Invalid Login Attempts
        console.log('\n6️⃣ Testing invalid login attempts...');
        
        try {
            await axios.post(`${API_BASE_URL}/login`, {
                email: testUsers[0].email,
                password: 'wrongpassword',
                role: testUsers[0].role
            });
            console.log('❌ Security Issue: Wrong password accepted!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Security working: Invalid password rejected');
            }
        }

        console.log('\n🎉 AUTHENTICATION TESTING COMPLETED');
        console.log('═══════════════════════════════════════');

    } catch (error) {
        console.error('💥 Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n❌ Cannot connect to server. Please ensure the server is running on port 5002');
        }
    }
}

// Run the test
if (require.main === module) {
    testAuthentication().catch(console.error);
}

module.exports = testAuthentication;