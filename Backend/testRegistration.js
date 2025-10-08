const http = require('http');

const testRegistration = () => {
    console.log('🔍 Testing registration endpoint...');
    
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
            'Content-Length': Buffer.byteLength(testData)
        }
    };
    
    const req = http.request(options, (res) => {
        console.log('📊 Response status:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                console.log('📄 Response data:', jsonData);
            } catch (e) {
                console.log('📄 Raw response:', data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Error testing registration:', error);
    });
    
    req.write(testData);
    req.end();
};

testRegistration();