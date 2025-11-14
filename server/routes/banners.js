const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all sale banners (public)
router.get('/', async (req, res) => {
  try {
    const [banners] = await db.query(
      'SELECT * FROM sale_banners WHERE is_active = TRUE ORDER BY display_order ASC'
    );

    // Transform to camelCase for frontend
    const formattedBanners = banners.map(banner => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      discountText: banner.discount_text || '',
      description: banner.description || '',
      imageUrl: banner.image_url || '',
      backgroundColor: banner.background_color || 'from-red-500 to-orange-500',
      buttonText: banner.button_text || 'Shop Now',
      buttonLink: banner.button_link || '#',
      isActive: Boolean(banner.is_active),
      displayOrder: banner.display_order,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    }));

    res.json(formattedBanners);
  } catch (error) {
    console.error('Get sale banners error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch sale banners', status: 500 }
    });
  }
});

// Get all banners including inactive (admin only)
router.get('/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [banners] = await db.query(
      'SELECT * FROM sale_banners ORDER BY display_order ASC'
    );

    const formattedBanners = banners.map(banner => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      discountText: banner.discount_text || '',
      description: banner.description || '',
      imageUrl: banner.image_url || '',
      backgroundColor: banner.background_color || 'from-red-500 to-orange-500',
      buttonText: banner.button_text || 'Shop Now',
      buttonLink: banner.button_link || '#',
      isActive: Boolean(banner.is_active),
      displayOrder: banner.display_order,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    }));

    res.json(formattedBanners);
  } catch (error) {
    console.error('Get all sale banners error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch sale banners', status: 500 }
    });
  }
});

// Create new banner (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { 
      title, 
      subtitle, 
      discountText, 
      description, 
      imageUrl, 
      backgroundColor, 
      buttonText, 
      buttonLink, 
      displayOrder,
      isActive 
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: { message: 'Title is required', status: 400 }
      });
    }

    const [result] = await db.query(
      `INSERT INTO sale_banners 
        (title, subtitle, discount_text, description, image_url, background_color, button_text, button_link, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle || null,
        discountText || null,
        description || null,
        imageUrl || null,
        backgroundColor || 'from-red-500 to-orange-500',
        buttonText || 'Shop Now',
        buttonLink || '#',
        displayOrder || 0,
        isActive !== false
      ]
    );

    const [banners] = await db.query(
      'SELECT * FROM sale_banners WHERE id = ?',
      [result.insertId]
    );

    const banner = banners[0];
    const formattedBanner = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      discountText: banner.discount_text || '',
      description: banner.description || '',
      imageUrl: banner.image_url || '',
      backgroundColor: banner.background_color,
      buttonText: banner.button_text,
      buttonLink: banner.button_link || '#',
      isActive: Boolean(banner.is_active),
      displayOrder: banner.display_order,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    };

    res.status(201).json(formattedBanner);
  } catch (error) {
    console.error('Create sale banner error:', error);
    res.status(500).json({
      error: { message: 'Failed to create sale banner', status: 500 }
    });
  }
});

// Update banner (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      subtitle, 
      discountText, 
      description, 
      imageUrl, 
      backgroundColor, 
      buttonText, 
      buttonLink, 
      displayOrder,
      isActive 
    } = req.body;

    await db.query(
      `UPDATE sale_banners 
       SET title = ?, subtitle = ?, discount_text = ?, description = ?, image_url = ?, 
           background_color = ?, button_text = ?, button_link = ?, display_order = ?, is_active = ?, 
           updated_at = NOW() 
       WHERE id = ?`,
      [
        title,
        subtitle || null,
        discountText || null,
        description || null,
        imageUrl || null,
        backgroundColor || 'from-red-500 to-orange-500',
        buttonText || 'Shop Now',
        buttonLink || '#',
        displayOrder || 0,
        isActive !== false,
        id
      ]
    );

    const [banners] = await db.query(
      'SELECT * FROM sale_banners WHERE id = ?',
      [id]
    );

    if (banners.length === 0) {
      return res.status(404).json({
        error: { message: 'Banner not found', status: 404 }
      });
    }

    const banner = banners[0];
    const formattedBanner = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      discountText: banner.discount_text || '',
      description: banner.description || '',
      imageUrl: banner.image_url || '',
      backgroundColor: banner.background_color,
      buttonText: banner.button_text,
      buttonLink: banner.button_link || '#',
      isActive: Boolean(banner.is_active),
      displayOrder: banner.display_order,
      createdAt: banner.created_at,
      updatedAt: banner.updated_at
    };

    res.json(formattedBanner);
  } catch (error) {
    console.error('Update sale banner error:', error);
    res.status(500).json({
      error: { message: 'Failed to update sale banner', status: 500 }
    });
  }
});

// Delete banner (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM sale_banners WHERE id = ?', [id]);

    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete sale banner error:', error);
    res.status(500).json({
      error: { message: 'Failed to delete sale banner', status: 500 }
    });
  }
});

module.exports = router;
