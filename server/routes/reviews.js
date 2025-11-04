const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all reviews (public)
router.get('/', async (req, res) => {
  try {
    const featured = req.query.featured === 'true';
    
    let query = 'SELECT * FROM reviews';
    if (featured) {
      query += ' WHERE featured = true';
    }
    query += ' ORDER BY created_at DESC';

    const [reviews] = await db.query(query);
    
    // Transform snake_case to camelCase for frontend
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      clientName: review.author_name,
      company: review.author_company || '',
      position: review.author_role || '',
      reviewText: review.review_text,
      rating: review.rating,
      avatarUrl: review.avatar_url,
      projectTitle: review.project_title || '',
      createdAt: review.created_at,
      isPublished: review.featured || false
    }));
    
    res.json({ reviews: transformedReviews });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch reviews', status: 500 }
    });
  }
});

// Get single review (public)
router.get('/:id', async (req, res) => {
  try {
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE id = ?',
      [req.params.id]
    );

    if (reviews.length === 0) {
      return res.status(404).json({
        error: { message: 'Review not found', status: 404 }
      });
    }

    const review = reviews[0];
    res.json({ 
      review: {
        id: review.id,
        clientName: review.author_name,
        company: review.author_company || '',
        position: review.author_role || '',
        reviewText: review.review_text,
        rating: review.rating,
        avatarUrl: review.avatar_url,
        projectTitle: review.project_title || '',
        createdAt: review.created_at,
        isPublished: review.featured || false
      }
    });

  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch review', status: 500 }
    });
  }
});

// Create review (admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('clientName').notEmpty().trim(),
    body('position').optional().trim(),
    body('company').optional().trim(),
    body('reviewText').notEmpty().trim(),
    body('rating').isInt({ min: 1, max: 5 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error('Validation errors:', errors.array());
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const {
        clientName,
        company,
        position,
        avatarUrl,
        rating,
        reviewText,
        projectTitle,
        isPublished
      } = req.body;

      const id = uuidv4();

      await db.query(
        `INSERT INTO reviews 
        (id, author_name, author_role, author_company, avatar_url, rating, review_text, project_title, featured) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          clientName,
          position || '',
          company || '',
          avatarUrl || null,
          rating,
          reviewText,
          projectTitle || null,
          isPublished || false
        ]
      );

      const [reviews] = await db.query('SELECT * FROM reviews WHERE id = ?', [id]);
      const review = reviews[0];
      
      res.status(201).json({ 
        review: {
          id: review.id,
          clientName: review.author_name,
          company: review.author_company || '',
          position: review.author_role || '',
          reviewText: review.review_text,
          rating: review.rating,
          avatarUrl: review.avatar_url,
          projectTitle: review.project_title || '',
          createdAt: review.created_at,
          isPublished: review.featured || false
        }
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        error: { message: 'Failed to create review', status: 500 }
      });
    }
  }
);

// Update review (admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const {
        clientName,
        company,
        position,
        avatarUrl,
        rating,
        reviewText,
        projectTitle,
        isPublished
      } = req.body;

      await db.query(
        `UPDATE reviews SET 
        author_name = ?, author_role = ?, author_company = ?, avatar_url = ?, 
        rating = ?, review_text = ?, project_title = ?, featured = ?
        WHERE id = ?`,
        [
          clientName,
          position || '',
          company || '',
          avatarUrl,
          rating,
          reviewText,
          projectTitle || null,
          isPublished || false,
          req.params.id
        ]
      );

      const [reviews] = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
      
      if (reviews.length === 0) {
        return res.status(404).json({
          error: { message: 'Review not found', status: 404 }
        });
      }

      const review = reviews[0];
      res.json({ 
        review: {
          id: review.id,
          clientName: review.author_name,
          company: review.author_company || '',
          position: review.author_role || '',
          reviewText: review.review_text,
          rating: review.rating,
          avatarUrl: review.avatar_url,
          projectTitle: review.project_title || '',
          createdAt: review.created_at,
          isPublished: review.featured || false
        }
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        error: { message: 'Failed to update review', status: 500 }
      });
    }
  }
);

// Delete review (admin only)
router.delete('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [result] = await db.query(
        'DELETE FROM reviews WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: { message: 'Review not found', status: 404 }
        });
      }

      res.json({ message: 'Review deleted successfully' });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        error: { message: 'Failed to delete review', status: 500 }
      });
    }
  }
);

module.exports = router;
