const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all plans (public - only active)
router.get('/', async (req, res) => {
  try {
    const showAll = req.query.all === 'true' && req.user?.role === 'admin';
    
    let query = 'SELECT * FROM plans';
    if (!showAll) {
      query += ' WHERE active = true';
    }
    query += ' ORDER BY display_order ASC, created_at DESC';

    const [plans] = await db.query(query);

    // Parse JSON features and convert price to number
    const plansWithParsedJson = plans.map(plan => ({
      ...plan,
      tier: plan.tier || 'basic',
      description: plan.description || '',
      price: parseFloat(plan.price),
      features: JSON.parse(plan.features || '[]'),
      isPopular: plan.popular || false,
      isActive: plan.active || false
    }));

    res.json({ plans: plansWithParsedJson });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch plans', status: 500 }
    });
  }
});

// Get single plan (public)
router.get('/:id', async (req, res) => {
  try {
    const [plans] = await db.query(
      'SELECT * FROM plans WHERE id = ?',
      [req.params.id]
    );

    if (plans.length === 0) {
      return res.status(404).json({
        error: { message: 'Plan not found', status: 404 }
      });
    }

    const plan = {
      ...plans[0],
      tier: plans[0].tier || 'basic',
      description: plans[0].description || '',
      price: parseFloat(plans[0].price),
      features: JSON.parse(plans[0].features || '[]'),
      isPopular: plans[0].popular || false,
      isActive: plans[0].active || false
    };

    res.json({ plan });

  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch plan', status: 500 }
    });
  }
});

// Create plan (admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('name').notEmpty().trim(),
    body('tier').optional().trim(),
    body('price').isNumeric(),
    body('currency').optional().trim(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Plan validation errors:', errors.array());
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const {
        name,
        tier,
        price,
        currency,
        duration,
        description,
        features,
        popular,
        active,
        displayOrder
      } = req.body;

      const id = uuidv4();

      await db.query(
        `INSERT INTO plans 
        (id, name, tier, price, currency, duration, description, features, popular, active, display_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          name,
          tier || 'basic',
          price,
          currency || 'USD',
          duration || '',
          description || '',
          JSON.stringify(features || []),
          popular || false,
          active !== false,
          displayOrder || 0
        ]
      );

      const [plans] = await db.query('SELECT * FROM plans WHERE id = ?', [id]);
      const plan = {
        ...plans[0],
        tier: plans[0].tier || 'basic',
        description: plans[0].description || '',
        price: parseFloat(plans[0].price),
        features: JSON.parse(plans[0].features || '[]'),
        isPopular: plans[0].popular || false,
        isActive: plans[0].active || false
      };

      res.status(201).json({ plan });

    } catch (error) {
      console.error('Create plan error:', error);
      console.error('Error details:', error.message);
      console.error('SQL Error:', error.sqlMessage);
      res.status(500).json({
        error: { 
          message: 'Failed to create plan', 
          status: 500,
          details: error.sqlMessage || error.message
        }
      });
    }
  }
);

// Update plan (admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const {
        name,
        tier,
        price,
        currency,
        duration,
        description,
        features,
        popular,
        active,
        displayOrder
      } = req.body;

      await db.query(
        `UPDATE plans SET 
        name = ?, tier = ?, price = ?, currency = ?, duration = ?, description = ?, 
        features = ?, popular = ?, active = ?, display_order = ?
        WHERE id = ?`,
        [
          name,
          tier || 'basic',
          price,
          currency || 'USD',
          duration || '',
          description || '',
          JSON.stringify(features || []),
          popular || false,
          active !== false,
          displayOrder || 0,
          req.params.id
        ]
      );

      const [plans] = await db.query('SELECT * FROM plans WHERE id = ?', [req.params.id]);
      
      if (plans.length === 0) {
        return res.status(404).json({
          error: { message: 'Plan not found', status: 404 }
        });
      }

      const plan = {
        ...plans[0],
        tier: plans[0].tier || 'basic',
        description: plans[0].description || '',
        price: parseFloat(plans[0].price),
        features: JSON.parse(plans[0].features || '[]'),
        isPopular: plans[0].popular || false,
        isActive: plans[0].active || false
      };

      res.json({ plan });

    } catch (error) {
      console.error('Update plan error:', error);
      console.error('Error details:', error.message);
      console.error('SQL Error:', error.sqlMessage);
      res.status(500).json({
        error: { 
          message: 'Failed to update plan', 
          status: 500,
          details: error.sqlMessage || error.message
        }
      });
    }
  }
);

// Delete plan (admin only)
router.delete('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [result] = await db.query(
        'DELETE FROM plans WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: { message: 'Plan not found', status: 404 }
        });
      }

      res.json({ message: 'Plan deleted successfully' });

    } catch (error) {
      console.error('Delete plan error:', error);
      res.status(500).json({
        error: { message: 'Failed to delete plan', status: 500 }
      });
    }
  }
);

module.exports = router;
