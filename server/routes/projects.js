const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all projects (public)
router.get('/', async (req, res) => {
  try {
    const [projects] = await db.query(
      'SELECT * FROM projects ORDER BY created_at DESC'
    );

    // Parse JSON fields and convert snake_case to camelCase
    const projectsWithParsedJson = projects.map(project => ({
      id: project.id,
      slug: project.slug,
      title: project.title,
      category: project.category,
      description: project.description,
      videoUrl: project.video_url,
      thumbnailUrl: project.thumbnail_url,
      tools: JSON.parse(project.tools || '[]'),
      gallery: JSON.parse(project.gallery || '[]'),
      featured: project.featured,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }));

    res.json({ projects: projectsWithParsedJson });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch projects', status: 500 }
    });
  }
});

// Get single project by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const [projects] = await db.query(
      'SELECT * FROM projects WHERE slug = ?',
      [req.params.slug]
    );

    if (projects.length === 0) {
      return res.status(404).json({
        error: { message: 'Project not found', status: 404 }
      });
    }

    const project = {
      id: projects[0].id,
      slug: projects[0].slug,
      title: projects[0].title,
      category: projects[0].category,
      description: projects[0].description,
      videoUrl: projects[0].video_url,
      thumbnailUrl: projects[0].thumbnail_url,
      tools: JSON.parse(projects[0].tools || '[]'),
      gallery: JSON.parse(projects[0].gallery || '[]'),
      featured: projects[0].featured,
      createdAt: projects[0].created_at,
      updatedAt: projects[0].updated_at
    };

    res.json({ project });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: { message: 'Failed to fetch project', status: 500 }
    });
  }
});

// Create project (admin only)
router.post('/',
  authMiddleware,
  adminOnly,
  [
    body('title').notEmpty().trim(),
    body('slug').notEmpty().trim(),
    body('category').optional().trim(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: { message: 'Invalid input', errors: errors.array() }
        });
      }

      const {
        title,
        slug,
        category,
        description,
        videoUrl,
        thumbnailUrl,
        tools,
        gallery,
        featured
      } = req.body;

      const id = uuidv4();

      await db.query(
        `INSERT INTO projects 
        (id, slug, title, category, description, video_url, thumbnail_url, tools, gallery, featured) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          slug,
          title,
          category || null,
          description || null,
          videoUrl || null,
          thumbnailUrl || null,
          JSON.stringify(tools || []),
          JSON.stringify(gallery || []),
          featured || false
        ]
      );

      const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
      const project = {
        id: projects[0].id,
        slug: projects[0].slug,
        title: projects[0].title,
        category: projects[0].category,
        description: projects[0].description,
        videoUrl: projects[0].video_url,
        thumbnailUrl: projects[0].thumbnail_url,
        tools: JSON.parse(projects[0].tools || '[]'),
        gallery: JSON.parse(projects[0].gallery || '[]'),
        featured: projects[0].featured,
        createdAt: projects[0].created_at,
        updatedAt: projects[0].updated_at
      };

      res.status(201).json({ project });

    } catch (error) {
      console.error('Create project error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          error: { message: 'Project with this slug already exists', status: 409 }
        });
      }

      res.status(500).json({
        error: { message: 'Failed to create project', status: 500 }
      });
    }
  }
);

// Update project (admin only)
router.put('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const {
        title,
        slug,
        category,
        description,
        videoUrl,
        thumbnailUrl,
        tools,
        gallery,
        featured
      } = req.body;

      await db.query(
        `UPDATE projects SET 
        slug = ?, title = ?, category = ?, description = ?, 
        video_url = ?, thumbnail_url = ?, tools = ?, gallery = ?, featured = ?
        WHERE id = ?`,
        [
          slug,
          title,
          category,
          description,
          videoUrl,
          thumbnailUrl,
          JSON.stringify(tools || []),
          JSON.stringify(gallery || []),
          featured || false,
          req.params.id
        ]
      );

      const [projects] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
      
      if (projects.length === 0) {
        return res.status(404).json({
          error: { message: 'Project not found', status: 404 }
        });
      }

      const project = {
        id: projects[0].id,
        slug: projects[0].slug,
        title: projects[0].title,
        category: projects[0].category,
        description: projects[0].description,
        videoUrl: projects[0].video_url,
        thumbnailUrl: projects[0].thumbnail_url,
        tools: JSON.parse(projects[0].tools || '[]'),
        gallery: JSON.parse(projects[0].gallery || '[]'),
        featured: projects[0].featured,
        createdAt: projects[0].created_at,
        updatedAt: projects[0].updated_at
      };

      res.json({ project });

    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        error: { message: 'Failed to update project', status: 500 }
      });
    }
  }
);

// Delete project (admin only)
router.delete('/:id',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const [result] = await db.query(
        'DELETE FROM projects WHERE id = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: { message: 'Project not found', status: 404 }
        });
      }

      res.json({ message: 'Project deleted successfully' });

    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        error: { message: 'Failed to delete project', status: 500 }
      });
    }
  }
);

module.exports = router;
