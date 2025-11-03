import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Log startup configuration
console.log('');
console.log('🔧 ========================================');
console.log('🔧 SERVER CONFIGURATION');
console.log('🔧 ========================================');
console.log('   PORT:', PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('   CORS_ORIGIN:', process.env.CORS_ORIGIN || 'NOT SET');
console.log('   DB_HOST:', process.env.DB_HOST || 'NOT SET');
console.log('   DB_NAME:', process.env.DB_NAME || 'NOT SET');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '***' + process.env.JWT_SECRET.slice(-4) : 'NOT SET');
console.log('🔧 ========================================');
console.log('');

// Security middleware - Configure helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Allow multiple CORS origins
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'https://harbi.benmina.com',
  'https://www.harbi.benmina.com',
  'https://benmina.com',
  'http://localhost:3001',
  'http://localhost:5173'
].filter(Boolean);

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
console.log('🌐 CORS enabled for:', corsOrigin);
console.log('   Allowed origins:', allowedOrigins);

// CORS configuration - MUST be before any routes
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log(`🔍 CORS Check - Origin: ${origin || 'none'}`);
    
    // Allow requests with no origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      console.log('   ✅ Allowed - No origin header');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`   ✅ Allowed - Origin in whitelist`);
      callback(null, true);
    } else {
      console.log(`   ✅ Allowed - Origin not in whitelist but allowing anyway`);
      // Allow all origins for now to debug
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

// Apply CORS globally
app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  
  // Add CORS headers manually as a fallback
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  }
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    console.log('   ✅ Handling OPTIONS preflight request');
    res.status(204).end();
    return;
  }
  
  next();
});

// Rate limiting
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes default
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

const limiter = rateLimit({
  windowMs: windowMs,
  max: maxRequests
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  console.log('💚 Health check requested');
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    cors: process.env.CORS_ORIGIN || 'default'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ ERROR:', err.message);
  console.error('   Path:', req.path);
  console.error('   Method:', req.method);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log('🚀 ================================');
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS Origin: ${corsOrigin}`);
  console.log(`   Database: ${process.env.DB_NAME || 'NOT CONFIGURED'}`);
  console.log('🚀 ================================');
  console.log('');
});

export default app;
