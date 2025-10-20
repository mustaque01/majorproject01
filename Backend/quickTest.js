/**
 * Quick test for the current server running on port 5000
 */
const http = require('http');

// Test if server is running
const testData = JSON.stringify({
    firstName: 'Test',
    lastName: 'User', 
    email: 'test@example.com',
    password: '123456',
    role: 'student',
    institution: 'Test University'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

console.log('🧪 Testing server on http://localhost:5000/api/auth/register');

const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('✅ Response received:');
            console.log(JSON.stringify(result, null, 2));
        } catch (error) {
            console.log('📝 Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
});

req.write(testData);
req.end();