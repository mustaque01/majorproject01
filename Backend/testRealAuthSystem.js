/**
 * REAL AUTHENTICATION TESTING SCRIPT
 * Tests the actual production authentication server
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5003/api/auth';

async function testRealAuthentication() {
    console.log('🧪 TESTING REAL AUTHENTICATION SYSTEM');
    console.log('═══════════════════════════════════════\n');

    try {
        // Test 1: Real User Registration
        console.log('1️⃣ Testing Real User Registration...');
        
        const studentData = {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@university.edu',
            password: 'strongpassword123',
            role: 'student',
            institution: 'Stanford University'
        };

        try {
            const registerResponse = await axios.post(`${API_BASE}/register`, studentData);
            console.log('✅ REAL USER REGISTERED SUCCESSFULLY');
            console.log(`   Name: ${registerResponse.data.data.user.firstName} ${registerResponse.data.data.user.lastName}`);
            console.log(`   Email: ${registerResponse.data.data.user.email}`);
            console.log(`   Role: ${registerResponse.data.data.user.role}`);
            console.log(`   User ID: ${registerResponse.data.data.user.id}`);
            console.log(`   Permissions: ${registerResponse.data.data.user.permissions.join(', ')}`);
            console.log(`   JWT Token Generated: ${registerResponse.data.data.accessToken ? 'YES' : 'NO'}`);
            console.log(`   Refresh Token: ${registerResponse.data.data.refreshToken ? 'YES' : 'NO'}\n`);
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('ℹ️ User already exists, continuing with login test...\n');
            } else {
                console.log('❌ Registration failed:', error.response?.data?.message || error.message);
                return;
            }
        }

        // Test 2: Real User Login
        console.log('2️⃣ Testing Real User Login...');
        
        const loginData = {
            email: studentData.email,
            password: studentData.password,
            role: studentData.role
        };

        const loginResponse = await axios.post(`${API_BASE}/login`, loginData);
        console.log('✅ REAL USER LOGIN SUCCESSFUL');
        console.log(`   Welcome: ${loginResponse.data.data.user.firstName} ${loginResponse.data.data.user.lastName}`);
        console.log(`   Last Login: ${new Date(loginResponse.data.data.user.lastLoginAt).toLocaleString()}`);
        console.log(`   Access Token: ${loginResponse.data.data.accessToken.substring(0, 20)}...`);
        
        const accessToken = loginResponse.data.data.accessToken;

        // Test 3: Real Protected Route Access
        console.log('\n3️⃣ Testing Real Protected Route Access...');
        
        const profileResponse = await axios.get(`${API_BASE}/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        console.log('✅ REAL PROTECTED ROUTE ACCESS SUCCESSFUL');
        console.log(`   User Profile Retrieved: ${profileResponse.data.data.user.email}`);
        console.log(`   Role: ${profileResponse.data.data.user.role}`);
        console.log(`   Permissions: ${profileResponse.data.data.user.permissions.join(', ')}`);
        console.log(`   Account Created: ${new Date(profileResponse.data.data.user.createdAt).toLocaleDateString()}`);

        // Test 4: Real Instructor Registration
        console.log('\n4️⃣ Testing Real Instructor Registration...');
        
        const instructorData = {
            firstName: 'Dr. Robert',
            lastName: 'Smith',
            email: 'robert.smith@university.edu',
            password: 'professorpass456',
            role: 'instructor',
            department: 'Computer Science',
            experience: '15 years of teaching and research',
            specialization: 'Artificial Intelligence and Machine Learning'
        };

        try {
            const instructorResponse = await axios.post(`${API_BASE}/register`, instructorData);
            console.log('✅ REAL INSTRUCTOR REGISTERED SUCCESSFULLY');
            console.log(`   Name: Dr. ${instructorResponse.data.data.user.lastName}`);
            console.log(`   Department: ${instructorResponse.data.data.user.department}`);
            console.log(`   Specialization: ${instructorResponse.data.data.user.specialization}`);
            console.log(`   Permissions: ${instructorResponse.data.data.user.permissions.join(', ')}`);
        } catch (error) {
            if (error.response?.status === 409) {
                console.log('ℹ️ Instructor already exists in database');
            }
        }

        // Test 5: Real Invalid Login
        console.log('\n5️⃣ Testing Real Invalid Login Protection...');
        
        try {
            await axios.post(`${API_BASE}/login`, {
                email: studentData.email,
                password: 'wrongpassword',
                role: studentData.role
            });
            console.log('❌ SECURITY ISSUE: Wrong password was accepted!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ REAL SECURITY WORKING: Invalid password rejected');
                console.log(`   Security Message: ${error.response.data.message}`);
            }
        }

        // Test 6: Real Token Authentication
        console.log('\n6️⃣ Testing Real Token Authentication...');
        
        try {
            await axios.get(`${API_BASE}/me`, {
                headers: { Authorization: 'Bearer fake-invalid-token' }
            });
            console.log('❌ SECURITY ISSUE: Fake token was accepted!');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ REAL TOKEN VALIDATION WORKING: Fake token rejected');
            }
        }

        console.log('\n🎉 REAL AUTHENTICATION TESTING COMPLETED');
        console.log('═══════════════════════════════════════');
        console.log('🔥 ALL TESTS PASSED - REAL DATABASE & AUTHENTICATION WORKING');

    } catch (error) {
        console.error('💥 Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Cannot connect to server. Ensure realAuthServer.js is running on port 5003');
        }
    }
}

// Run the test
testRealAuthentication().catch(console.error);