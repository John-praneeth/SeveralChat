const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  provider: {
    type: String,
    required: true,
    default: 'local',
  },
  role: {
    type: String,
    default: 'USER',
  },
  banned: {
    type: Boolean,
    default: false,
  },
  refreshToken: [{
    type: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
