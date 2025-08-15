const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Connect to the same MongoDB as LibreChat
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://praneeth:s7XJ2hwfZhggIwQz@librechat.v7jxcfg.mongodb.net/LibreChat';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

// Import LibreChat models (we'll create simplified versions)
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Middleware to verify admin token
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);
    
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all users with pagination
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken -totpSecret')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:userId/role', verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password -refreshToken -totpSecret');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ban/unban user
router.post('/users/:userId/ban', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Toggle ban status (assuming we have a banned field)
    const banned = !user.banned;
    await User.findByIdAndUpdate(req.params.userId, { banned });

    res.json({ 
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      banned 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's conversations and messages
    await Conversation.deleteMany({ user: req.params.userId });
    await Message.deleteMany({ user: req.params.userId });
    await User.findByIdAndDelete(req.params.userId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();
    
    // Active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: thirtyDaysAgo }
    });

    // Banned users count
    const bannedUsers = await User.countDocuments({ banned: true });
    
    // Admin users count
    const adminUsers = await User.countDocuments({ role: 'ADMIN' });

    // User growth statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: thisWeek }
    });
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });

    // Security metrics
    const unverifiedUsers = await User.countDocuments({ emailVerified: false });
    const usersWithTwoFactor = await User.countDocuments({ twoFactorEnabled: true });

    res.json({
      overview: {
        totalUsers,
        totalConversations,
        totalMessages,
        activeUsers,
        bannedUsers,
        adminUsers
      },
      userGrowth: {
        today: newUsersToday,
        thisWeek: newUsersThisWeek,
        thisMonth: newUsersThisMonth
      },
      security: {
        unverifiedUsers,
        usersWithTwoFactor,
        verificationRate: totalUsers > 0 ? ((totalUsers - unverifiedUsers) / totalUsers * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk user operations
router.post('/users/bulk', verifyAdmin, async (req, res) => {
  try {
    const { action, userIds, data } = req.body;
    
    if (!action || !userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    let result;
    switch (action) {
      case 'ban':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { banned: true, bannedAt: new Date(), bannedBy: req.user._id }
        );
        break;
      case 'unban':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { banned: false, $unset: { bannedAt: 1, bannedBy: 1 } }
        );
        break;
      case 'verify':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { emailVerified: true }
        );
        break;
      case 'role':
        if (!data?.role || !['USER', 'ADMIN'].includes(data.role)) {
          return res.status(400).json({ error: 'Invalid role' });
        }
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { role: data.role }
        );
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ 
      message: `Bulk ${action} completed successfully`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User activity logs
router.get('/users/:userId/activity', verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Get recent conversations
    const conversations = await Conversation.find({ user: userId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email');

    // Get recent messages count
    const recentMessages = await Message.countDocuments({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      conversations,
      metrics: {
        totalConversations: await Conversation.countDocuments({ user: userId }),
        totalMessages: await Message.countDocuments({ user: userId }),
        recentMessages
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User export functionality
router.get('/users/export', verifyAdmin, async (req, res) => {
  try {
    const format = req.query.format || 'json';
    const users = await User.find({})
      .select('-password -refreshToken -totpSecret')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const csv = [
        'ID,Name,Email,Username,Role,Email Verified,Banned,Created At,Updated At',
        ...users.map(user => 
          `${user._id},${user.name || ''},${user.email},${user.username || ''},${user.role},${user.emailVerified},${user.banned || false},${user.createdAt},${user.updatedAt}`
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send(csv);
    } else {
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Security audit log
router.get('/security/audit', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Get recently banned users
    const recentBans = await User.find({ banned: true })
      .sort({ bannedAt: -1 })
      .limit(10)
      .select('name email bannedAt bannedBy');

    // Get recent admin role changes
    const recentAdmins = await User.find({ role: 'ADMIN' })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('name email role createdAt updatedAt');

    // Get unverified users
    const unverifiedUsers = await User.find({ emailVerified: false })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('name email createdAt');

    res.json({
      recentBans,
      recentAdmins,
      unverifiedUsers,
      summary: {
        totalBanned: await User.countDocuments({ banned: true }),
        totalAdmins: await User.countDocuments({ role: 'ADMIN' }),
        totalUnverified: await User.countDocuments({ emailVerified: false })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database operations
router.get('/database/info', verifyAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    const collections = await db.listCollections().toArray();
    
    res.json({
      database: stats,
      collections: collections.map(col => col.name)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
