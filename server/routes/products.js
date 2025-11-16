const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Category name to ID mapping
const getCategoryId = (categoryName) => {
  const categoryMap = {
    'Visage': 1,
    'Maquillage': 2,
    'Corps': 3,
    'Cheveux': 4,
    'Bébé & Maman': 5,
    'Homme': 6,
    'Hygiène': 7,
    'Solaire': 8,
    'Santé': 9,
    'Para-médical': 10,
    'Bio': 11,
    'PROMOTION': 12
  };
  return categoryMap[categoryName] || 1; // Default to 1 if not found
};

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );

    // Convert to match frontend Product interface
    const formattedProducts = products.map(product => ({
      id: parseInt(product.id),
      categoryId: getCategoryId(product.category), // Map category name to ID
      hostId: 1, // Default host
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      stockQuantity: parseInt(product.stock),
      imageUrl: product.image_url || '',
      isActive: Boolean(product.in_stock),
      ingredients: [], // Empty array by default
      specs: [], // Empty array by default
      reviews: [], // Empty array by default
      // Also include snake_case for backward compatibility
      category: product.category,
      stock: parseInt(product.stock),
      inStock: Boolean(product.in_stock),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch products', status: 500 }
    });
  }
});

// Get single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ?',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        error: { message: 'Product not found', status: 404 }
      });
    }

    const product = products[0];
    
    // Format to match frontend Product interface
    const formattedProduct = {
      id: parseInt(product.id),
      categoryId: getCategoryId(product.category), // Map category name to ID
      hostId: 1,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      stockQuantity: parseInt(product.stock),
      imageUrl: product.image_url || '',
      isActive: Boolean(product.in_stock),
      ingredients: [],
      specs: [],
      reviews: [],
      category: product.category,
      stock: parseInt(product.stock),
      inStock: Boolean(product.in_stock),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch product', status: 500 }
    });
  }
});

// Create product (admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Product validation errors:', errors.array());
      console.error('Request body:', req.body);
      return res.status(400).json({ 
        error: { message: 'Validation failed', status: 400 },
        errors: errors.array() 
      });
    }

    try {
      const {
        name,
        description,
        price,
        category,
        imageUrl,
        stock,
        inStock
      } = req.body;

      const [result] = await db.query(
        `INSERT INTO products 
         (name, description, price, category, image_url, stock, in_stock) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || '',
          price,
          category,
          imageUrl || '',
          stock || 0,
          inStock !== undefined ? inStock : true
        ]
      );

      const [newProduct] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(newProduct[0]);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        error: { message: 'Failed to create product', status: 500 }
      });
    }
  }
);

// Update product (admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        price,
        category,
        imageUrl,
        stock,
        inStock
      } = req.body;

      // Check if product exists
      const [existing] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          error: { message: 'Product not found', status: 404 }
        });
      }

      await db.query(
        `UPDATE products 
         SET name = ?, description = ?, price = ?, category = ?, 
             image_url = ?, stock = ?, in_stock = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          name || existing[0].name,
          description !== undefined ? description : existing[0].description,
          price !== undefined ? price : existing[0].price,
          category || existing[0].category,
          imageUrl !== undefined ? imageUrl : existing[0].image_url,
          stock !== undefined ? stock : existing[0].stock,
          inStock !== undefined ? inStock : existing[0].in_stock,
          id
        ]
      );

      const [updated] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      res.json(updated[0]);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        error: { message: 'Failed to update product', status: 500 }
      });
    }
  }
);

// Delete product (admin only)
router.delete('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      const [existing] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          error: { message: 'Product not found', status: 404 }
        });
      }

      await db.query('DELETE FROM products WHERE id = ?', [id]);

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        error: { message: 'Failed to delete product', status: 500 }
      });
    }
  }
);

module.exports = router;
