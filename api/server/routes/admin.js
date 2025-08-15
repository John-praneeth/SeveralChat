const express = require('express');
const { logger } = require('@librechat/data-schemas');
const { SystemRoles } = require('librechat-data-provider');
const { checkAdmin, requireJwtAuth } = require('~/server/middleware');
const {
  getAllUsers,
  updateUserRole,
  banUser,
  unbanUser,
  deleteUserAdmin,
  getUserStats,
  getSystemStats,
  searchUsers,
} = require('~/server/controllers/AdminController');

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(requireJwtAuth);
router.use(checkAdmin);

/**
 * GET /api/admin/users
 * Get all users with pagination and filtering
 */
router.get('/users', getAllUsers);

/**
 * GET /api/admin/users/search
 * Search users by email, username, or name
 */
router.get('/users/search', searchUsers);

/**
 * GET /api/admin/users/:userId/stats
 * Get detailed stats for a specific user
 */
router.get('/users/:userId/stats', getUserStats);

/**
 * PUT /api/admin/users/:userId/role
 * Update user role
 */
router.put('/users/:userId/role', updateUserRole);

/**
 * POST /api/admin/users/:userId/ban
 * Ban a user
 */
router.post('/users/:userId/ban', banUser);

/**
 * POST /api/admin/users/:userId/unban
 * Unban a user
 */
router.post('/users/:userId/unban', unbanUser);

/**
 * DELETE /api/admin/users/:userId
 * Delete a user (admin only)
 */
router.delete('/users/:userId', deleteUserAdmin);

/**
 * GET /api/admin/stats
 * Get system-wide statistics
 */
router.get('/stats', getSystemStats);

module.exports = router;
