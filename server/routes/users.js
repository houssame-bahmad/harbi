const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, full_name, role, phone, address, city, postal_code, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch users', status: 500 }
    });
  }
});

// Get delivery persons (admin only)
router.get('/delivery-persons', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, full_name, phone FROM users WHERE role = "delivery" ORDER BY full_name ASC'
    );

    res.json(users);
  } catch (error) {
    console.error('Get delivery persons error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch delivery persons', status: 500 }
    });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['admin', 'editor', 'viewer', 'customer', 'delivery'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: { message: 'Invalid role', status: 400 }
      });
    }

    await db.query(
      'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
      [role, id]
    );

    const [users] = await db.query(
      'SELECT id, email, full_name, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: { message: 'User not found', status: 404 }
      });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      error: { message: 'Failed to update user role', status: 500 }
    });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, full_name, role, phone, address, city, postal_code, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: { message: 'User not found', status: 404 }
      });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch profile', status: 500 }
    });
  }
});

// Update current user profile
router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { full_name, phone, address, city, postal_code } = req.body;

    await db.query(
      `UPDATE users 
       SET full_name = ?, phone = ?, address = ?, city = ?, postal_code = ?, updated_at = NOW()
       WHERE id = ?`,
      [full_name, phone, address, city, postal_code, req.user.id]
    );

    const [users] = await db.query(
      'SELECT id, email, full_name, role, phone, address, city, postal_code, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json(users[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: { message: 'Failed to update profile', status: 500 }
    });
  }
});

module.exports = router;
