import { Router } from 'express';
import pool from '../config/database';
import { authMiddleware, adminOnly, deliveryOrAdmin } from '../middleware/auth';

const router = Router();

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             json_agg(json_build_object('productId', oi.product_id, 'productName', p.name, 'quantity', oi.quantity, 'price', oi.price)) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.order_date DESC
    `, [req.user?.userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all orders (admin)
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             u.full_name as customer_name, 
             u.email as customer_email,
             u.phone_number as customer_phone,
             d.full_name as delivery_person_name,
             json_agg(json_build_object('productId', oi.product_id, 'productName', p.name, 'quantity', oi.quantity, 'price', oi.price)) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users d ON o.delivery_person_id = d.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.full_name, u.email, u.phone_number, d.full_name
      ORDER BY o.order_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get delivery person's orders
router.get('/delivery', authMiddleware, deliveryOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, 
             u.full_name as customer_name, 
             u.email as customer_email,
             u.phone_number as customer_phone,
             json_agg(json_build_object('productId', oi.product_id, 'productName', p.name, 'quantity', oi.quantity, 'price', oi.price)) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.delivery_person_id = $1
      GROUP BY o.id, u.full_name, u.email, u.phone_number
      ORDER BY o.order_date DESC
    `, [req.user?.userId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery orders' });
  }
});

// Create order
router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { items, deliveryAddress, paymentMethod, totalAmount } = req.body;
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, delivery_address, payment_method, status, payment_status) 
       VALUES ($1, $2, $3, $4, 'Pending', 'Pending') 
       RETURNING *`,
      [req.user?.userId, totalAmount, deliveryAddress, paymentMethod]
    );
    
    const order = orderResult.rows[0];
    
    // Create order items and update stock
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.productId, item.quantity, item.price]
      );
      
      await client.query(
        `UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [item.quantity, item.productId]
      );
    }
    
    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    client.release();
  }
});

// Update order status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await client.query('BEGIN');
    
    // Get current order status
    const currentOrder = await client.query('SELECT status FROM orders WHERE id = $1', [id]);
    const currentStatus = currentOrder.rows[0]?.status;
    
    // If cancelling order, return items to stock
    if (status === 'Cancelled' && currentStatus !== 'Cancelled') {
      const items = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [id]
      );
      
      for (const item of items.rows) {
        await client.query(
          'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }
    }
    
    // Update order status
    const result = await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    client.release();
  }
});

// Update payment status
router.patch('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const result = await pool.query(
      'UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *',
      [paymentStatus, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Assign delivery person
router.patch('/:id/assign', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    
    const result = await pool.query(
      `UPDATE orders SET delivery_person_id = $1, status = 'Out for Delivery' WHERE id = $2 RETURNING *`,
      [deliveryPersonId, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ error: 'Failed to assign delivery person' });
  }
});

export default router;
