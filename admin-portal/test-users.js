const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  username: { type: String },
  role: { type: String, default: 'USER' },
  emailVerified: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  lastLogin: { type: Date },
  provider: { type: String }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function testUserAPI() {
  try {
    console.log('🔍 Testing user data access...');
    
    // Test basic user count
    const totalUsers = await User.countDocuments();
    console.log(`👥 Total users: ${totalUsers}`);
    
    // Test user listing (similar to the API)
    const users = await User.find({})
      .select('-password -refreshToken -totpSecret')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log('\n📋 User list:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role || 'USER'}`);
      console.log(`   Verified: ${user.emailVerified || false}`);
      console.log(`   Created: ${user.createdAt || 'N/A'}`);
      console.log(`   Banned: ${user.banned || false}`);
      console.log('');
    });
    
    // Test login for admin user
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    if (adminUser) {
      console.log('🔑 Admin user found:');
      console.log(`   ID: ${adminUser._id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      
      // Generate a test token
      const token = jwt.sign(
        { id: adminUser._id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '24h' }
      );
      console.log(`   Test Token: ${token.substring(0, 50)}...`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testUserAPI();
