import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

const router = Router();

// Register
router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty(),
  body('phoneNumber').notEmpty()
], async (req, res) => {
  try {
    console.log('📝 REGISTER REQUEST:');
    console.log('   Email:', req.body.email);
    console.log('   Name:', req.body.fullName);
    
    const { email, password, fullName, phoneNumber } = req.body;

    // Check if user exists
    console.log('   Checking if user exists...');
    const userCheck = await query('SELECT * FROM users WHERE email = ?', [email]);
    const existingUsers = userCheck.rows as any[];
    if (existingUsers.length > 0) {
      console.log('   ❌ User already exists');
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    console.log('   Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    console.log('   Creating user in database...');
    const result = await query(
      'INSERT INTO users (email, password, name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, fullName, phoneNumber, 'USER']
    );

    const userId = (result.rows as any).insertId;
    console.log('   ✅ User created with ID:', userId);

    // Get the created user
    const userResult = await query('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?', [userId]);
    const userRows = userResult.rows as any[];
    const user = userRows[0];

    // Generate token
    console.log('   Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    console.log('   ✅ Registration successful!');
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        phoneNumber: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    console.log('🔐 LOGIN REQUEST:');
    console.log('   Email:', req.body.email);
    
    const { email, password } = req.body;

    // Find user
    console.log('   Looking up user in database...');
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    const users = result.rows as any[];
    if (users.length === 0) {
      console.log('   ❌ User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('   ✅ User found:', user.email, '(Role:', user.role + ')');

    // Verify password
    console.log('   Verifying password...');
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('   ❌ Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('   ✅ Password valid');
    
    // Generate token
    console.log('   Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    console.log('   ✅ Login successful!');
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        phoneNumber: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
