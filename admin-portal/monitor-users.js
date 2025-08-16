const mongoose = require('mongoose');
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
  role: { type: String, default: 'USER' },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function monitorUsers() {
  console.log('👀 Monitoring database for new users...');
  console.log('📅 Current time:', new Date().toLocaleString());
  
  // Get initial count
  let lastCount = await User.countDocuments();
  console.log(`📊 Current user count: ${lastCount}`);
  console.log('');
  console.log('🔄 Checking every 5 seconds for new users...');
  console.log('💡 Go to http://localhost:3080 and sign up a new user to test!');
  console.log('');

  setInterval(async () => {
    try {
      const currentCount = await User.countDocuments();
      
      if (currentCount > lastCount) {
        console.log(`🎉 NEW USER DETECTED! Count increased from ${lastCount} to ${currentCount}`);
        
        // Get the newest user
        const newestUser = await User.findOne({}, {}, { sort: { 'createdAt': -1 } });
        console.log('👤 Newest user details:');
        console.log(`   📧 Email: ${newestUser.email}`);
        console.log(`   👤 Name: ${newestUser.name || 'N/A'}`);
        console.log(`   🔑 Role: ${newestUser.role}`);
        console.log(`   ✅ Verified: ${newestUser.emailVerified}`);
        console.log(`   📅 Created: ${newestUser.createdAt}`);
        console.log('');
        
        lastCount = currentCount;
      } else if (currentCount !== lastCount) {
        console.log(`⚠️  User count changed: ${lastCount} -> ${currentCount}`);
        lastCount = currentCount;
      }
    } catch (error) {
      console.error('❌ Error monitoring users:', error.message);
    }
  }, 5000); // Check every 5 seconds
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n👋 Stopping user monitoring...');
  mongoose.connection.close();
  process.exit(0);
});

monitorUsers();
