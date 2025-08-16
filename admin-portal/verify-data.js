const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
console.log('🔌 Connecting to MongoDB Atlas...');
console.log('URI:', MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
}).then(async () => {
  console.log('✅ Connected successfully!');
  
  const db = mongoose.connection.db;
  
  // Check users collection
  const usersCount = await db.collection('users').countDocuments();
  console.log(`👥 Total users in database: ${usersCount}`);
  
  // Check messages collection
  let messagesCount = 0;
  try {
    messagesCount = await db.collection('messages').countDocuments();
  } catch (error) {
    console.log('📝 Messages collection: Not found or empty');
  }
  console.log(`💬 Total messages in database: ${messagesCount}`);
  
  // Check conversations collection
  let conversationsCount = 0;
  try {
    conversationsCount = await db.collection('conversations').countDocuments();
  } catch (error) {
    console.log('💭 Conversations collection: Not found or empty');
  }
  console.log(`💭 Total conversations in database: ${conversationsCount}`);
  
  // Get a sample user to verify structure
  const sampleUser = await db.collection('users').findOne({}, { projection: { password: 0 } });
  if (sampleUser) {
    console.log('👤 Sample user structure:');
    console.log('   - ID:', sampleUser._id);
    console.log('   - Email:', sampleUser.email);
    console.log('   - Name:', sampleUser.name || 'N/A');
    console.log('   - Role:', sampleUser.role || 'USER');
    console.log('   - Created:', sampleUser.createdAt || 'N/A');
    console.log('   - Email Verified:', sampleUser.emailVerified || false);
  }
  
  mongoose.connection.close();
  console.log('🔚 Connection closed');
}).catch(error => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});
