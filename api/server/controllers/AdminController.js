const { logger } = require('@librechat/data-schemas');
const { SystemRoles } = require('librechat-data-provider');
const {
  getUsers,
  findUser,
  updateUser,
  deleteUserById,
  createUser,
} = require('~/models');
const { User, Conversation, Message, Balance, Transaction } = require('~/db/models');
const { deleteConvos, deleteMessages, deletePresets } = require('~/models');
const { deleteUserPluginAuth } = require('~/server/services/PluginService');
const { deleteUserKey } = require('~/server/services/UserService');
const { deleteAllUserSessions } = require('~/models');

/**
 * Get all users with pagination and filtering
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      role,
      status,
      search,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    if (role) {
      filter.role = role;
    }
    if (status === 'banned') {
      filter.refreshToken = { $exists: false };
    }
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(filter)
      .select('-password -totpSecret -refreshToken')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(filter);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const conversationCount = await Conversation.countDocuments({ user: user._id });
        const messageCount = await Message.countDocuments({ user: user._id });
        const balance = await Balance.findOne({ user: user._id }).select('tokenCredits');
        
        return {
          ...user,
          stats: {
            conversationCount,
            messageCount,
            balance: balance?.tokenCredits || 0,
          },
        };
      })
    );

    res.json({
      users: usersWithStats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('[getAllUsers]', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

/**
 * Search users by email, username, or name
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { email: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
      ],
    })
      .select('_id email username name avatar role createdAt')
      .limit(20)
      .lean();

    res.json({ users });
  } catch (error) {
    logger.error('[searchUsers]', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
};

/**
 * Get detailed stats for a specific user
 */
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -totpSecret -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get detailed statistics
    const [
      conversationCount,
      messageCount,
      balance,
      transactions,
      recentConversations,
      recentMessages,
    ] = await Promise.all([
      Conversation.countDocuments({ user: userId }),
      Message.countDocuments({ user: userId }),
      Balance.findOne({ user: userId }),
      Transaction.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
      Conversation.find({ user: userId })
        .select('title createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(10),
      Message.find({ user: userId })
        .select('text createdAt conversationId')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      user,
      stats: {
        conversationCount,
        messageCount,
        balance: balance?.tokenCredits || 0,
        totalTransactions: transactions.length,
      },
      recentActivity: {
        conversations: recentConversations,
        messages: recentMessages,
        transactions,
      },
    });
  } catch (error) {
    logger.error('[getUserStats]', error);
    res.status(500).json({ message: 'Failed to retrieve user stats' });
  }
};

/**
 * Update user role
 */
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!Object.values(SystemRoles).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await updateUser(userId, { role });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Admin ${req.user.email} updated user ${user.email} role to ${role}`);
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    logger.error('[updateUserRole]', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
};

/**
 * Ban a user
 */
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    // Remove all refresh tokens to effectively ban the user
    await deleteAllUserSessions({ userId });
    
    // Optionally, you could add a banned field to the user model
    const user = await updateUser(userId, { 
      banned: true, 
      banReason: reason,
      bannedAt: new Date(),
      bannedBy: req.user.id 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Admin ${req.user.email} banned user ${user.email}. Reason: ${reason}`);
    res.json({ message: 'User banned successfully' });
  } catch (error) {
    logger.error('[banUser]', error);
    res.status(500).json({ message: 'Failed to ban user' });
  }
};

/**
 * Unban a user
 */
const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await updateUser(userId, { 
      banned: false, 
      banReason: null,
      bannedAt: null,
      bannedBy: null 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Admin ${req.user.email} unbanned user ${user.email}`);
    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    logger.error('[unbanUser]', error);
    res.status(500).json({ message: 'Failed to unban user' });
  }
};

/**
 * Delete a user (admin only)
 */
const deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await findUser({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all user data
    await Promise.all([
      deleteMessages({ user: userId }),
      deleteAllUserSessions({ userId }),
      Transaction.deleteMany({ user: userId }),
      deleteUserKey({ userId, all: true }),
      Balance.deleteMany({ user: userId }),
      deletePresets(userId),
      deleteConvos(userId),
      deleteUserPluginAuth(userId, null, true),
      deleteUserById(userId),
    ]);

    logger.info(`Admin ${req.user.email} deleted user ${user.email}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('[deleteUserAdmin]', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/**
 * Get system-wide statistics
 */
const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalConversations,
      totalMessages,
      totalTransactions,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    ] = await Promise.all([
      User.countDocuments({}),
      Conversation.countDocuments({}),
      Message.countDocuments({}),
      Transaction.countDocuments({}),
      User.countDocuments({ 
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
      }),
      User.countDocuments({ 
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } 
      }),
      User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
      }),
      User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      }),
    ]);

    // Get role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Get usage statistics over time (last 30 days)
    const usageStats = await Message.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalConversations,
        totalMessages,
        totalTransactions,
        activeUsers,
      },
      userGrowth: {
        today: newUsersToday,
        thisWeek: newUsersThisWeek,
        thisMonth: newUsersThisMonth,
      },
      roleDistribution,
      usageStats,
    });
  } catch (error) {
    logger.error('[getSystemStats]', error);
    res.status(500).json({ message: 'Failed to retrieve system stats' });
  }
};

module.exports = {
  getAllUsers,
  searchUsers,
  getUserStats,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUserAdmin,
  getSystemStats,
};
