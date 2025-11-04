const express = require('express');
const router = express.Router();
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Upload media (admin only) - store base64 in DB
router.post('/upload',
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const { dataUrl, filename, originalName } = req.body;

      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ error: { message: 'Invalid data URL', status: 400 } });
      }

      // If already a remote URL, return as-is
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        return res.json({ url: dataUrl });
      }

      // Expect a data:base64 string - more flexible regex for various MIME types
      const matches = dataUrl.match(/^data:([A-Za-z0-9\-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.error('❌ Invalid base64 format received:', {
          hasDataUrl: !!dataUrl,
          dataUrlLength: dataUrl?.length,
          dataUrlStart: dataUrl?.substring(0, 100),
          matchResult: matches
        });
        return res.status(400).json({ error: { message: 'Invalid base64 format', status: 400 } });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const uniqueId = uuidv4();
      const storedFilename = `${uniqueId}` + (filename ? '-' + filename : '');
      const size = Buffer.byteLength(base64Data, 'base64');

      // Insert into DB
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/api/media/${uniqueId}`;

      const insertQuery = `
        INSERT INTO media_files (id, filename, original_name, mime_type, size, path, url, base64_data, storage_type, uploaded_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'base64', NULL, NOW())
      `;

      await db.query(insertQuery, [
        uniqueId,
        storedFilename,
        originalName || filename || storedFilename,
        mimeType,
        size,
        null,
        fileUrl,
        base64Data
      ]);

      console.log(`✅ Stored media (base64) in DB: ${uniqueId} (${mimeType}, ${size} bytes)`);

      return res.json({ url: fileUrl, id: uniqueId });

    } catch (err) {
      console.error('❌ Upload error:', err);
      return res.status(500).json({ error: { message: 'Failed to upload media', status: 500 } });
    }
  }
);

// Handle preflight requests for CORS
router.options('/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  res.status(204).end();
});

// Serve media from DB (public)
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📥 Fetching media: ${id}`);
    
    const query = 'SELECT filename, mime_type, base64_data, url, storage_type FROM media_files WHERE id = ?';
    const [rows] = await db.query(query, [id]);

    if (!rows || rows.length === 0) {
      console.log(`❌ Media not found: ${id}`);
      return res.status(404).json({ error: { message: 'File not found', status: 404 } });
    }

    const media = rows[0];
    console.log(`✅ Media found: ${id}`, {
      storageType: media.storage_type,
      mimeType: media.mime_type,
      hasBase64: !!media.base64_data,
      base64Length: media.base64_data?.length,
      hasUrl: !!media.url
    });

    // If stored as base64, convert and send
    if (media.storage_type === 'base64' && media.base64_data) {
      try {
        // Check if base64 data exists and is valid
        if (!media.base64_data || media.base64_data.length === 0) {
          console.error(`❌ Empty base64 data for ${id}`);
          return res.status(404).json({ error: { message: 'Empty media data', status: 404 } });
        }

        // Log base64 length before conversion
        console.log(`📤 Converting base64 to buffer: ${id}, base64 length: ${media.base64_data.length}`);
        
        const buffer = Buffer.from(media.base64_data, 'base64');
        console.log(`✅ Buffer created successfully: ${id}, buffer size: ${buffer.length} bytes`);
        
        // Set CORS headers for cross-origin access
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        res.setHeader('Content-Type', media.mime_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${media.filename || id}"`);
        
        // Aggressive caching - 1 year
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('ETag', `"${id}"`);
        res.setHeader('Last-Modified', new Date().toUTCString());
        
        console.log(`📤 Sending buffer to client: ${id}`);
        return res.send(buffer);
      } catch (bufferError) {
        console.error(`❌ Error creating/sending buffer for ${id}:`, bufferError.message, bufferError.stack);
        return res.status(500).json({ 
          error: { 
            message: 'Failed to process media data', 
            status: 500,
            details: bufferError.message 
          } 
        });
      }
    }

    // If URL/path stored, redirect or proxy
    if (media.url) {
      console.log(`🔀 Redirecting to URL: ${media.url}`);
      return res.redirect(media.url);
    }

    console.log(`❌ No valid data for media: ${id}`);
    return res.status(404).json({ error: { message: 'File not available', status: 404 } });

  } catch (err) {
    console.error('❌ Serve file error:', err);
    return res.status(500).json({ error: { message: 'Failed to serve file', status: 500 } });
  }
});

module.exports = router;
