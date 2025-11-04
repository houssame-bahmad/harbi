const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all about sections (public)
router.get('/', async (req, res) => {
  try {
    const [sections] = await db.query(
      'SELECT * FROM about_content ORDER BY display_order ASC, created_at ASC'
    );

    res.json({ sections });

  } catch (error) {
    console.error('Get about sections error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch about sections', status: 500 }
    });
  }
});

// Get single section (public)
router.get('/:section', async (req, res) => {
  try {
    const [sections] = await db.query(
      'SELECT * FROM about_content WHERE section = ?',
      [req.params.section]
    );

    if (sections.length === 0) {
      return res.status(404).json({
        error: { message: 'Section not found', status: 404 }
      });
    }

    res.json({ section: sections[0] });

  } catch (error) {
    console.error('Get about section error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch section', status: 500 }
    });
  }
});

// Create or update about section (admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('section').notEmpty().trim(),
    body('title').optional().trim(),
    body('content').optional().trim()
  ],
  async (req, res) => {
    try {
      console.log('📥 About POST request received:', {
        section: req.body.section,
        hasContent: !!req.body.content,
        hasImageUrl: !!req.body.imageUrl,
        user: req.user?.email
      });

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('❌ Validation errors:', errors.array());
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const {
        section,
        title,
        content,
        imageUrl,
        displayOrder
      } = req.body;

      console.log('💾 Processing section:', section);

      // Check if section exists
      const [existing] = await db.query(
        'SELECT id FROM about_content WHERE section = ?',
        [section]
      );

      if (existing.length > 0) {
        // Update existing section
        console.log('🔄 Updating existing section:', section);
        await db.query(
          `UPDATE about_content SET 
          title = ?, content = ?, image_url = ?, display_order = ?
          WHERE section = ?`,
          [
            title || null,
            content || null,
            imageUrl || null,
            displayOrder || 0,
            section
          ]
        );

        const [updated] = await db.query(
          'SELECT * FROM about_content WHERE section = ?',
          [section]
        );

        console.log('✅ Section updated successfully');
        return res.json({ section: updated[0] });
      } else {
        // Create new section
        console.log('➕ Creating new section:', section);
        const id = uuidv4();

        await db.query(
          `INSERT INTO about_content 
          (id, section, title, content, image_url, display_order) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            id,
            section,
            title || null,
            content || null,
            imageUrl || null,
            displayOrder || 0
          ]
        );

        const [created] = await db.query(
          'SELECT * FROM about_content WHERE id = ?',
          [id]
        );

        console.log('✅ Section created successfully');
        return res.status(201).json({ section: created[0] });
      }

    } catch (error) {
      console.error('❌ Save about section error:', error);
      res.status(500).json({
        error: { message: 'Failed to save section', status: 500 }
      });
    }
  }
);

// Update about section by ID (admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const {
        section,
        title,
        content,
        imageUrl,
        displayOrder
      } = req.body;

      await db.query(
        `UPDATE about_content SET 
        section = ?, title = ?, content = ?, image_url = ?, display_order = ?
        WHERE id = ?`,
        [
          section,
          title,
          content,
          imageUrl,
          displayOrder || 0,
          req.params.id
        ]
      );

      const [sections] = await db.query(
        'SELECT * FROM about_content WHERE id = ?',
        [req.params.id]
      );
      
      if (sections.length === 0) {
        return res.status(404).json({
          error: { message: 'Section not found', status: 404 }
        });
      }

      res.json({ section: sections[0] });

    } catch (error) {
      console.error('Update about section error:', error);
      res.status(500).json({
        error: { message: 'Failed to update section', status: 500 }
      });
    }
  }
);

// Delete about section (admin only)
router.delete('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [result] = await db.query(
        'DELETE FROM about_content WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: { message: 'Section not found', status: 404 }
        });
      }

      res.json({ message: 'Section deleted successfully' });

    } catch (error) {
      console.error('Delete about section error:', error);
      res.status(500).json({
        error: { message: 'Failed to delete section', status: 500 }
      });
    }
  }
);

module.exports = router;
