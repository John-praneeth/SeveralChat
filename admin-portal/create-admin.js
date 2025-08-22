const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://praneeth:s7XJ2hwfZhggIwQz@librechat.v7jxcfg.mongodb.net/LibreChat';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

// Define User schema (matching LibreChat's schema)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'USER' },
  emailVerified: { type: Boolean, default: true },
  provider: { type: String, default: 'local' },
  banned: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connection.once('open', () => {
      console.log('✅ Connected to MongoDB Atlas successfully!');
    });

    const email = 'admin@test.com';
    const password = 'admin123';
    const name = 'Admin User';
    
    console.log('👤 Checking if user already exists...');
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists, updating role to ADMIN...');
      await User.findByIdAndUpdate(existingUser._id, { role: 'ADMIN' });
      console.log('✅ User role updated to ADMIN');
      process.exit(0);
    }

    console.log('🔐 Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log('👤 Creating admin user...');
    // Create admin user
    const adminUser = new User({
      email,
      name,
      username: 'admin-portal',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: true,
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('🌐 Login at: http://localhost:4000');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 Check your MongoDB connection string and network connectivity');
    }
    process.exit(1);
  }
}

createAdminUser();
