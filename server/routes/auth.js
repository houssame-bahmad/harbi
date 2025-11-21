const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Health check for /api/auth
router.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Auth API is running' });
});

// Login
router.post('/login', 
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const { email, password } = req.body;

      // Find user
      const [users] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          error: { message: 'Invalid email or password' }
        });
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          error: { message: 'Invalid email or password' }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name || '',
          phoneNumber: user.phone || '',
          createdAt: user.created_at
        },
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: { message: 'Login failed', status: 500 }
      });
    }
  }
);

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('fullName').optional().trim(),
    body('phoneNumber').optional().trim()
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const { email, password, fullName, phoneNumber } = req.body;

      // Check if user already exists
      const [existingUsers] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          error: { message: 'User with this email already exists' }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate UUID for user ID (to match VARCHAR(36) schema)
      const { v4: uuidv4 } = require('uuid');
      const userId = uuidv4();

      console.log('📝 Creating user with ID:', userId);

      // Create user
      const [result] = await db.query(
        'INSERT INTO users (id, email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, email, hashedPassword, fullName || '', phoneNumber || '', 'user']
      );

      console.log('✅ User created successfully');

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: userId, 
          email: email, 
          role: 'user' 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '7d' }
      );

      res.status(201).json({
        user: {
          id: userId,
          email: email,
          role: 'user',
          fullName: fullName || '',
          phoneNumber: phoneNumber || '',
          createdAt: new Date()
        },
        token
      });

    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState,
        errno: error.errno
      });
      res.status(500).json({
        error: { 
          message: 'Registration failed', 
          status: 500,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      });
    }
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, role, full_name, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: { message: 'User not found' }
      });
    }

    const user = users[0];
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name || '',
        phoneNumber: user.phone || '',
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: { message: 'Failed to get user', status: 500 }
    });
  }
});

// Change password
router.post('/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user
      const [users] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({
          error: { message: 'User not found' }
        });
      }

      const user = users[0];

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);

      if (!isValid) {
        return res.status(401).json({
          error: { message: 'Current password is incorrect' }
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, req.user.id]
      );

      res.json({ message: 'Password updated successfully' });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: { message: 'Failed to change password', status: 500 }
      });
    }
  }
);

module.exports = router;
