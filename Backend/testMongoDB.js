const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB connection...');

// Simple connection without complex options
mongoose.connect('mongodb://localhost:27017/learning-path-fresh')
.then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
        name: String,
        createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', TestSchema);
    
    console.log('� Creating test document...');
    const testDoc = new TestModel({ name: 'Test Connection' });
    await testDoc.save();
    console.log('✅ Test document created successfully');
    
    // Test querying
    console.log('🔍 Querying test document...');
    const found = await TestModel.findOne({ name: 'Test Connection' });
    console.log('✅ Test document found:', found);
    
    // Cleanup
    await TestModel.deleteMany({});
    console.log('🧽 Cleaned up test documents');
    
    await mongoose.connection.close();
    console.log('🔐 Connection closed successfully');
    
    console.log('✅ MongoDB connection test PASSED');
    process.exit(0);
    
}).catch(err => {
    console.error('❌ MongoDB connection test FAILED:', err);
    process.exit(1);
});

// Timeout the test after 15 seconds
setTimeout(() => {
    console.error('❌ Test timed out after 15 seconds');
    process.exit(1);
}, 15000);