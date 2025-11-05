const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all orders (admin only)
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.email as user_email, u.full_name as user_name,
             d.email as delivery_person_email, d.full_name as delivery_person_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users d ON o.delivery_person_id = d.id
      ORDER BY o.created_at DESC
    `);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch orders', status: 500 }
    });
  }
});

// Get orders for delivery person
router.get('/delivery', authMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, u.email as user_email, u.full_name as user_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.delivery_person_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch delivery orders', status: 500 }
    });
  }
});

// Get user's own orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.id]);

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch your orders', status: 500 }
    });
  }
});

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: { message: 'Order must contain at least one item', status: 400 }
      });
    }

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.query(
        `INSERT INTO orders (user_id, total_amount, payment_method, delivery_address, status, payment_status)
         VALUES (?, ?, ?, ?, 'pending', 'pending')`,
        [req.user.id, totalAmount, paymentMethod, deliveryAddress]
      );

      const orderId = orderResult.insertId;

      // Add order items
      for (let item of items) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.price]
        );

        // Update product stock
        await connection.query(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [item.quantity, item.productId]
        );
      }

      await connection.commit();

      // Fetch the created order with items
      const [orders] = await db.query(`
        SELECT o.*
        FROM orders o
        WHERE o.id = ?
      `, [orderId]);

      const [orderItems] = await db.query(`
        SELECT oi.*, p.name as product_name, p.image_url as product_image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      const order = orders[0];
      order.items = orderItems;

      res.status(201).json(order);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: { message: 'Failed to create order', status: 500 }
    });
  }
});

// Update order status (admin only)
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(orders[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: { message: 'Failed to update order status', status: 500 }
    });
  }
});

// Update payment status (admin only)
router.patch('/:id/payment', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    await db.query(
      `UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?`,
      [paymentStatus, id]
    );

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(orders[0]);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      error: { message: 'Failed to update payment status', status: 500 }
    });
  }
});

// Assign delivery person (admin only)
router.patch('/:id/assign', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;

    await db.query(
      `UPDATE orders SET delivery_person_id = ?, updated_at = NOW() WHERE id = ?`,
      [deliveryPersonId, id]
    );

    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    res.json(orders[0]);
  } catch (error) {
    console.error('Assign delivery person error:', error);
    res.status(500).json({
      error: { message: 'Failed to assign delivery person', status: 500 }
    });
  }
});

module.exports = router;
