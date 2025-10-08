const { MongoClient } = require('mongodb');

async function testDirectMongoDB() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    
    try {
        console.log('🔍 Connecting to MongoDB directly...');
        await client.connect();
        console.log('✅ Connected to MongoDB!');
        
        const db = client.db('learning-path-direct-test');
        const collection = db.collection('users');
        
        console.log('🔧 Inserting test document...');
        const result = await collection.insertOne({
            firstName: 'Test',
            lastName: 'User', 
            email: 'test@example.com',
            createdAt: new Date()
        });
        console.log('✅ Document inserted:', result.insertedId);
        
        console.log('🔍 Querying test document...');
        const doc = await collection.findOne({ email: 'test@example.com' });
        console.log('✅ Document found:', doc);
        
        console.log('🧽 Cleaning up...');
        await collection.deleteMany({ email: 'test@example.com' });
        console.log('✅ Cleanup completed');
        
        console.log('🎉 Direct MongoDB test PASSED');
        
    } catch (error) {
        console.error('❌ Direct MongoDB test FAILED:', error);
    } finally {
        await client.close();
        console.log('🔐 Connection closed');
    }
}

testDirectMongoDB();