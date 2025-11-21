const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get user's cart
router.get('/', authMiddleware, async (req, res) => {
  try {
    console.log('🛒 GET /cart - User ID:', req.user?.id);
    console.log('🛒 User object:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('❌ No user ID found in request');
      return res.status(401).json({
        error: { message: 'User not authenticated', status: 401 }
      });
    }
    
    const [cartItems] = await db.query(`
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        p.id,
        p.name,
        p.price,
        p.image_url as imageUrl,
        p.description,
        p.stock_quantity as stockQuantity
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);

    console.log('✅ Cart items found:', cartItems.length);
    res.json(cartItems);
  } catch (error) {
    console.error('❌ Get cart error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage
    });
    // If cart_items table doesn't exist yet, return empty cart
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn('⚠️  cart_items table does not exist. Please run the migration: CART-MIGRATION-PHPMYADMIN.sql');
      return res.json([]);
    }
    res.status(500).json({
      error: { message: 'Failed to get cart', details: error.message, status: 500 }
    });
  }
});

// Add item to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: { message: 'Product ID is required' }
      });
    }

    // Check if product exists and has stock
    const [products] = await db.query(
      'SELECT id, stock_quantity FROM products WHERE id = ?',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        error: { message: 'Product not found' }
      });
    }

    if (products[0].stock_quantity < quantity) {
      return res.status(400).json({
        error: { message: 'Insufficient stock' }
      });
    }

    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
    } else {
      // Insert new cart item
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, productId, quantity]
      );
    }

    // Return updated cart
    const [cartItems] = await db.query(`
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        p.id,
        p.name,
        p.price,
        p.image_url as imageUrl,
        p.description,
        p.stock_quantity as stockQuantity
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);

    res.json({ message: 'Item added to cart', cart: cartItems });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: { message: 'Failed to add item to cart', status: 500 }
    });
  }
});

// Update cart item quantity
router.put('/update/:cartItemId', authMiddleware, async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        error: { message: 'Quantity must be at least 1' }
      });
    }

    // Verify cart item belongs to user
    const [cartItem] = await db.query(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, req.user.id]
    );

    if (cartItem.length === 0) {
      return res.status(404).json({
        error: { message: 'Cart item not found' }
      });
    }

    await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    );

    // Return updated cart
    const [cartItems] = await db.query(`
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        p.id,
        p.name,
        p.price,
        p.image_url as imageUrl,
        p.description,
        p.stock_quantity as stockQuantity
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);

    res.json({ message: 'Cart updated', cart: cartItems });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      error: { message: 'Failed to update cart', status: 500 }
    });
  }
});

// Remove item from cart
router.delete('/remove/:cartItemId', authMiddleware, async (req, res) => {
  try {
    const { cartItemId } = req.params;

    // Verify cart item belongs to user and delete
    const [result] = await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: { message: 'Cart item not found' }
      });
    }

    // Return updated cart
    const [cartItems] = await db.query(`
      SELECT 
        c.id as cart_item_id,
        c.quantity,
        p.id,
        p.name,
        p.price,
        p.image_url as imageUrl,
        p.description,
        p.stock_quantity as stockQuantity
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);

    res.json({ message: 'Item removed from cart', cart: cartItems });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: { message: 'Failed to remove item from cart', status: 500 }
    });
  }
});

// Clear entire cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM cart_items WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ message: 'Cart cleared', cart: [] });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      error: { message: 'Failed to clear cart', status: 500 }
    });
  }
});

module.exports = router;
