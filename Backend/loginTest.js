/**
 * Quick login test
 */
const http = require('http');

const loginData = JSON.stringify({
    email: 'test@example.com',
    password: '123456',
    role: 'student'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

console.log('🧪 Testing login on http://localhost:5000/api/auth/login');

const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const result = JSON.parse(data);
            console.log('📝 Full response:', JSON.stringify(result, null, 2));
        } catch (error) {
            console.log('📝 Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Login failed:', error.message);
});

req.write(loginData);
req.end();