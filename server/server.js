require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (needed for Railway and similar platforms)
app.set('trust proxy', 1);

// 🛡️ Security middleware - configure Helmet to allow cross-origin media loading
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false  // Disable CSP to avoid blocking media
}));

// 🌐 CORS configuration - Apply global CORS first for all /api/media requests
app.use('/api/media', cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Content-Disposition'],
  credentials: false
}));

// Strict CORS for other API endpoints
const allowedOrigins = [
  'https://benmina.com',
  'https://www.benmina.com',
  'https://harbi.benmina.com',  // ✅ Added subdomain
  'http://benmina.com',
  'http://www.benmina.com',
  'http://harbi.benmina.com',   // ✅ Added subdomain
  process.env.CORS_ORIGIN,
  'http://localhost:5173', // optional: for local development
  'http://localhost:5174'
].filter(Boolean); // Remove undefined/null values

console.log('✅ Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(null, true); // Allow anyway for now to debug
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ✅ Explicitly handle preflight OPTIONS requests
app.options('*', cors());

// 🧠 Body parsing middleware - increased for video uploads
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// 🚦 Rate limiting (protects from brute-force attacks) - AFTER body parser
// Exclude /api/media/upload from rate limiting (large file uploads take time)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // increased limit
  skip: (req) => req.path === '/api/media/upload' // Skip rate limit for uploads
});
app.use('/api/', limiter);

// 📁 Static file serving (e.g. uploaded images)
app.use('/uploads', express.static('uploads'));

// 🔀 Import routes
const authRoutes = require('./routes/auth');
const projectsRoutes = require('./routes/projects');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const reviewsRoutes = require('./routes/reviews');
const plansRoutes = require('./routes/plans');
const aboutRoutes = require('./routes/about');
const contactRoutes = require('./routes/contact');
const mediaRoutes = require('./routes/media');
const bannersRoutes = require('./routes/banners');
const cartRoutes = require('./routes/cart');

// 📡 API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/cart', cartRoutes);

// ❤️ Health check endpoint (for uptime monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Benmina Media API is running',
    timestamp: new Date().toISOString()
  });
});

// ❌ 404 Not Found handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// ⚠️ Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 🚀 Start the server
app.listen(PORT, () => {
  console.log(`🚀 Benmina Media API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
