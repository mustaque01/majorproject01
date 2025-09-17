const mongoose = require('mongoose');

const testConnection = async () => {
    try {
        console.log('🔍 Testing MongoDB connection...');
        
        await mongoose.connect('mongodb://localhost:27017/learning-path-dashboard', {
            serverSelectionTimeoutMS: 5000 // 5 second timeout
        });
        
        console.log('✅ MongoDB connection successful!');
        
        // Test if we can perform a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`📋 Found ${collections.length} collections:`, collections.map(c => c.name));
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Solution: MongoDB server is not running. Please start MongoDB first.');
            console.log('   - Install MongoDB locally, or');
            console.log('   - Use MongoDB Atlas (cloud), or');
            console.log('   - Use Docker: docker run -d -p 27017:27017 --name mongodb mongo');
        }
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

testConnection();