const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://praneeth:s7XJ2hwfZhggIwQz@librechat.v7jxcfg.mongodb.net/LibreChat';

async function testAdminLogin() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin@test.com' });
    if (!user) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', user.email);
    console.log('Password hash exists:', !!user.password);
    
    // Test with common admin passwords
    const testPasswords = ['admin', 'admin123', 'password', 'test123', '123456'];
    
    for (const pwd of testPasswords) {
      try {
        const isValid = await bcrypt.compare(pwd, user.password);
        if (isValid) {
          console.log(`✅ Password found: ${pwd}`);
          return pwd;
        }
      } catch (e) {
        // Continue to next password
      }
    }
    
    console.log('❌ None of the test passwords worked');
    console.log('You may need to reset the admin password');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testAdminLogin();
