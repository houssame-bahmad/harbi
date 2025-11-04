const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get contact info (public)
router.get('/info', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM contact_info ORDER BY created_at DESC LIMIT 1'
    );

    if (rows.length === 0) {
      // Return default empty contact info if none exists
      return res.json({
        email: '',
        phone: '',
        socials: {
          linkedin: '',
          twitter: '',
          instagram: ''
        },
        cvUrl: ''
      });
    }

    // Transform flat structure to nested structure for frontend
    const info = rows[0];
    res.json({
      email: info.email || '',
      phone: info.phone || '',
      socials: {
        linkedin: info.linkedin || '',
        twitter: info.twitter || '',
        instagram: info.instagram || ''
      },
      cvUrl: info.cvUrl || ''
    });

  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch contact info', status: 500 }
    });
  }
});

// Update contact info (admin only)
router.put('/info',
  authMiddleware,
  adminOnly,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('socials.linkedin').optional().trim(),
    body('socials.twitter').optional().trim(),
    body('socials.instagram').optional().trim(),
    body('cvUrl').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const { email, phone, socials, cvUrl } = req.body;
      
      // Extract socials from nested object
      const linkedin = socials?.linkedin || '';
      const twitter = socials?.twitter || '';
      const instagram = socials?.instagram || '';

      // Check if contact info exists
      const [existing] = await db.query('SELECT id FROM contact_info LIMIT 1');

      if (existing.length === 0) {
        // Create new
        const id = uuidv4();
        await db.query(
          `INSERT INTO contact_info (id, email, phone, linkedin, twitter, instagram, cvUrl)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, email, phone, linkedin, twitter, instagram, cvUrl]
        );
      } else {
        // Update existing
        await db.query(
          `UPDATE contact_info 
           SET email = ?, phone = ?, linkedin = ?, twitter = ?, instagram = ?, cvUrl = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [email, phone, linkedin, twitter, instagram, cvUrl, existing[0].id]
        );
      }

      res.json({ message: 'Contact info updated successfully' });

    } catch (error) {
      console.error('Update contact info error:', error);
      res.status(500).json({
        error: { message: 'Failed to update contact info', status: 500 }
      });
    }
  }
);

// Submit contact form (public)
router.post('/',
  [
    body('name').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('subject').optional().trim().escape(),
    body('message').notEmpty().trim().escape()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const { name, email, subject, message } = req.body;
      const id = uuidv4();

      await db.query(
        `INSERT INTO contact_submissions 
        (id, name, email, subject, message, status) 
        VALUES (?, ?, ?, ?, ?, 'new')`,
        [id, name, email, subject || null, message]
      );

      res.status(201).json({ 
        message: 'Contact form submitted successfully',
        id 
      });

    } catch (error) {
      console.error('Submit contact form error:', error);
      res.status(500).json({
        error: { message: 'Failed to submit contact form', status: 500 }
      });
    }
  }
);

// Get all contact submissions (admin only)
router.get('/',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const status = req.query.status;
      
      let query = 'SELECT * FROM contact_submissions';
      const params = [];

      if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
        query += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const [submissions] = await db.query(query, params);
      res.json({ submissions });

    } catch (error) {
      console.error('Get contact submissions error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch submissions', status: 500 }
      });
    }
  }
);

// Get single submission (admin only)
router.get('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [submissions] = await db.query(
        'SELECT * FROM contact_submissions WHERE id = ?',
        [req.params.id]
      );

      if (submissions.length === 0) {
        return res.status(404).json({
          error: { message: 'Submission not found', status: 404 }
        });
      }

      // Mark as read if it's new
      if (submissions[0].status === 'new') {
        await db.query(
          "UPDATE contact_submissions SET status = 'read' WHERE id = ?",
          [req.params.id]
        );
        submissions[0].status = 'read';
      }

      res.json({ submission: submissions[0] });

    } catch (error) {
      console.error('Get contact submission error:', error);
      res.status(500).json({
        error: { message: 'Failed to fetch submission', status: 500 }
      });
    }
  }
);

// Update submission status (admin only)
router.patch('/:id/status',
  authMiddleware,
  adminOnly,
  [
    body('status').isIn(['new', 'read', 'replied', 'archived'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: { message: 'Invalid status', errors: errors.array() }
        });
      }

      const { status } = req.body;

      await db.query(
        'UPDATE contact_submissions SET status = ? WHERE id = ?',
        [status, req.params.id]
      );

      const [submissions] = await db.query(
        'SELECT * FROM contact_submissions WHERE id = ?',
        [req.params.id]
      );

      if (submissions.length === 0) {
        return res.status(404).json({
          error: { message: 'Submission not found', status: 404 }
        });
      }

      res.json({ submission: submissions[0] });

    } catch (error) {
      console.error('Update submission status error:', error);
      res.status(500).json({
        error: { message: 'Failed to update status', status: 500 }
      });
    }
  }
);

// Delete submission (admin only)
router.delete('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [result] = await db.query(
        'DELETE FROM contact_submissions WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: { message: 'Submission not found', status: 404 }
        });
      }

      res.json({ message: 'Submission deleted successfully' });

    } catch (error) {
      console.error('Delete submission error:', error);
      res.status(500).json({
        error: { message: 'Failed to delete submission', status: 500 }
      });
    }
  }
);

module.exports = router;
