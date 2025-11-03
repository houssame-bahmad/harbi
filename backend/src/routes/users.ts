import { Router } from 'express';
import pool from '../config/database';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, full_name, phone_number, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get delivery persons (admin only)
router.get('/delivery-persons', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, email, full_name, phone_number 
      FROM users 
      WHERE role = 'delivery'
      ORDER BY full_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get delivery persons error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery persons' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, full_name, phone_number, role, created_at',
      [role, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
