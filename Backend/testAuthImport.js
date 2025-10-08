// Test loading the auth routes
try {
    console.log('🔍 Testing auth routes import...');
    const authRoutes = require('../server/routes/auth');
    console.log('✅ Auth routes imported successfully');
    console.log('📋 Auth routes type:', typeof authRoutes);
    console.log('📋 Auth routes:', authRoutes);
} catch (error) {
    console.error('❌ Error importing auth routes:', error);
}