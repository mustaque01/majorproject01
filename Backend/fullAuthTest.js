/**
 * Test new user registration and login with fixed password hashing
 */
const http = require('http');

// Test registration first
const testData = JSON.stringify({
    firstName: 'Fixed',
    lastName: 'User', 
    email: 'fixed@example.com',
    password: '123456',
    role: 'student',
    institution: 'Test University'
});

const regOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

console.log('🧪 Testing registration with fixed password hashing...');

const regReq = http.request(regOptions, (res) => {
    console.log(`📊 Registration Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            if (result.success) {
                console.log('✅ Registration successful! Now testing login...');
                
                // Test login
                const loginData = JSON.stringify({
                    email: 'fixed@example.com',
                    password: '123456',
                    role: 'student'
                });

                const loginOptions = {
                    hostname: 'localhost',
                    port: 5000,
                    path: '/api/auth/login',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': loginData.length
                    }
                };

                const loginReq = http.request(loginOptions, (loginRes) => {
                    console.log(`📊 Login Status: ${loginRes.statusCode}`);
                    
                    let loginData = '';
                    loginRes.on('data', (chunk) => { loginData += chunk; });
                    
                    loginRes.on('end', () => {
                        try {
                            const loginResult = JSON.parse(loginData);
                            console.log('🔐 Login Response:');
                            console.log(`   Success: ${loginResult.success}`);
                            if (loginResult.success) {
                                console.log(`   User: ${loginResult.data.user.firstName} ${loginResult.data.user.lastName}`);
                                console.log(`   Role: ${loginResult.data.user.role}`);
                                console.log('   ✅ AUTHENTICATION SYSTEM IS NOW WORKING!');
                            } else {
                                console.log(`   ❌ Login failed: ${loginResult.message}`);
                            }
                        } catch (error) {
                            console.log('📝 Login raw response:', loginData);
                        }
                    });
                });

                loginReq.on('error', (error) => {
                    console.error('❌ Login request failed:', error.message);
                });

                loginReq.write(loginData);
                loginReq.end();
                
            } else {
                console.log('❌ Registration failed:', result.message);
            }
        } catch (error) {
            console.log('📝 Registration raw response:', data);
        }
    });
});

regReq.on('error', (error) => {
    console.error('❌ Registration failed:', error.message);
});

regReq.write(testData);
regReq.end();