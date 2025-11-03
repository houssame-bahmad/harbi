import { Router } from 'express';
import { query } from '../config/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM products 
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT * FROM products WHERE id = ?
    `, [id]);
    
    const rows = result.rows as any[];
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, image, category, ingredients, specs } = req.body;
    
    const result = await query(
      `INSERT INTO products (name, description, price, stock, image, category, ingredients, specs) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, stock || 0, image, category, ingredients, specs]
    );
    
    // Get the inserted product
    const insertId = (result.rows as any).insertId;
    const newProduct = await query('SELECT * FROM products WHERE id = ?', [insertId]);
    const productRows = newProduct.rows as any[];
    
    res.status(201).json(productRows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, image, category, ingredients, specs } = req.body;
    
    await query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?, image = ?, 
           category = ?, ingredients = ?, specs = ? 
       WHERE id = ?`,
      [name, description, price, stock, image, category, ingredients, specs, id]
    );
    
    // Get the updated product
    const result = await query('SELECT * FROM products WHERE id = ?', [id]);
    const rows = result.rows as any[];
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
