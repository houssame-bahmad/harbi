import { Router } from 'express';
import { query } from '../config/database';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await query(`
      SELECT id, email, name as full_name, phone as phone_number, role, created_at 
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
    const result = await query(`
      SELECT id, email, name as full_name, phone as phone_number 
      FROM users 
      WHERE role = 'DELIVERY'
      ORDER BY name
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
    
    // Update the user
    await query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );
    
    // Fetch the updated user
    const result = await query(
      'SELECT id, email, name as full_name, phone as phone_number, role, created_at FROM users WHERE id = ?',
      [id]
    );
    
    const users = result.rows as any[];
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;
