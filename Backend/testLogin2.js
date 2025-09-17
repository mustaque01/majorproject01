const http = require('http');

const testLogin = async () => {
    try {
        console.log('🔍 Testing login API endpoint...');
        
        const postData = JSON.stringify({
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
                'Content-Length': Buffer.byteLength(postData)
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
                    if (res.statusCode === 400 && jsonData.message) {
                        console.log('✅ Login endpoint is working (user validation failed as expected)');
                    }
                } catch (e) {
                    console.log('📄 Raw response:', data);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Error testing login:', error.message);
        });
        
        req.write(postData);
        req.end();
        
    } catch (error) {
        console.error('❌ Error testing login:', error.message);
    }
};

testLogin();