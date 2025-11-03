import { Router } from 'express';
import { query } from '../config/database';
import { authMiddleware, adminOnly, deliveryOrAdmin } from '../middleware/auth';

const router = Router();

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    // Get orders
    const ordersResult = await query(`
      SELECT * FROM orders 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user?.userId]);
    
    const orders = ordersResult.rows as any[];
    
    // Get order items for each order
    for (const order of orders) {
      const itemsResult = await query(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = itemsResult.rows;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all orders (admin)
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Get all orders with user info
    const ordersResult = await query(`
      SELECT o.*, 
             u.name as customer_name, 
             u.email as customer_email,
             d.name as delivery_person_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN users d ON o.delivery_person_id = d.id
      ORDER BY o.created_at DESC
    `);
    
    const orders = ordersResult.rows as any[];
    
    // Get order items for each order
    for (const order of orders) {
      const itemsResult = await query(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = itemsResult.rows;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get delivery person's orders
router.get('/delivery', authMiddleware, deliveryOrAdmin, async (req, res) => {
  try {
    // Get orders assigned to this delivery person
    const ordersResult = await query(`
      SELECT o.*, 
             u.name as customer_name, 
             u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.delivery_person_id = ?
      ORDER BY o.created_at DESC
    `, [req.user?.userId]);
    
    const orders = ordersResult.rows as any[];
    
    // Get order items for each order
    for (const order of orders) {
      const itemsResult = await query(`
        SELECT oi.*, p.name as product_name 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      order.items = itemsResult.rows;
    }
    
    res.json(orders);
  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({ error: 'Failed to fetch delivery orders' });
  }
});

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, deliveryAddress, phone, paymentMethod, totalAmount } = req.body;
    
    // Create order
    const orderResult = await query(
      `INSERT INTO orders (user_id, total, delivery_address, phone, status, payment_status) 
       VALUES (?, ?, ?, ?, 'PENDING', 'PENDING')`,
      [req.user?.userId, totalAmount, deliveryAddress, phone]
    );
    
    const orderId = (orderResult.rows as any).insertId;
    
    // Create order items and update stock
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );
      
      await query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.productId]
      );
    }
    
    // Get the created order
    const newOrder = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const orderRows = newOrder.rows as any[];
    
    res.status(201).json(orderRows[0]);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Get current order status
    const currentOrder = await query('SELECT status FROM orders WHERE id = ?', [id]);
    const currentOrderRows = currentOrder.rows as any[];
    const currentStatus = currentOrderRows[0]?.status;
    
    // If cancelling order, return items to stock
    if (status === 'CANCELLED' && currentStatus !== 'CANCELLED') {
      const items = await query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );
      
      const itemRows = items.rows as any[];
      for (const item of itemRows) {
        await query(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }
    }
    
    // Update order status
    await query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    
    // Get updated order
    const result = await query('SELECT * FROM orders WHERE id = ?', [id]);
    const resultRows = result.rows as any[];
    
    res.json(resultRows[0]);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update payment status
router.patch('/:id/payment', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    await query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [paymentStatus, id]
    );
    
    // Get updated order
    const result = await query('SELECT * FROM orders WHERE id = ?', [id]);
    const resultRows = result.rows as any[];
    
    res.json(resultRows[0]);
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
    
    await query(
      `UPDATE orders SET delivery_person_id = ?, status = 'OUT_FOR_DELIVERY' WHERE id = ?`,
      [deliveryPersonId, id]
    );
    
    // Get updated order
    const result = await query('SELECT * FROM orders WHERE id = ?', [id]);
    const resultRows = result.rows as any[];
    
    res.json(resultRows[0]);
  } catch (error) {
    console.error('Assign delivery error:', error);
    res.status(500).json({ error: 'Failed to assign delivery person' });
  }
});

export default router;
