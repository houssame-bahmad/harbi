# 🎯 YOUR DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OVERVIEW                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   FRONTEND       │────────>│   BACKEND        │────────>│   DATABASE       │
│                  │  HTTPS  │                  │  MySQL  │                  │
│  Hostinger       │         │   Railway        │         │  Hostinger       │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
harbi.benmina.com      your-app.up.railway.app      u894306996_harbi


┌─────────────────────────────────────────────────────────────┐
│                    DETAILED WORKFLOW                         │
└─────────────────────────────────────────────────────────────┘

1. User visits: https://harbi.benmina.com
   │
   ├─> Browser loads React app (from Hostinger)
   │
   └─> User clicks "Login" or "Browse Products"
       │
       ├─> Frontend sends request to:
       │   https://your-app.up.railway.app/api/auth/login
       │   
       └─> Railway Backend receives request
           │
           ├─> Validates credentials
           │
           ├─> Queries Hostinger MySQL:
           │   SELECT * FROM users WHERE email = ?
           │
           ├─> MySQL returns user data
           │
           ├─> Backend generates JWT token
           │
           └─> Returns JSON response to frontend
               │
               └─> Frontend stores token, updates UI


┌─────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT SETUP                         │
└─────────────────────────────────────────────────────────────┘

FRONTEND (Hostinger)
├─ Domain: harbi.benmina.com
├─ Path: public_html/harbi/
├─ Files: index.html, assets/, etc.
└─ API URL: https://your-app.up.railway.app

BACKEND (Railway)
├─ Auto-deploy from GitHub
├─ Build: npm install && npm run build
├─ Start: node dist/server.js
├─ Port: 5000 (Railway auto-assigns)
└─ Environment Variables:
    ├─ NODE_ENV=production
    ├─ DB_HOST=srv####.hstgr.io
    ├─ DB_USER=u894306996_harbi
    ├─ DB_PASSWORD=***
    ├─ CORS_ORIGIN=https://harbi.benmina.com
    └─ JWT_SECRET=***

DATABASE (Hostinger MySQL)
├─ Name: u894306996_harbi
├─ User: u894306996_harbi
├─ Remote Access: Enabled (%)
└─ Tables: users, products, orders, etc.


┌─────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW EXAMPLE                      │
└─────────────────────────────────────────────────────────────┘

Example: User adds product to cart

1. USER ACTION
   ↓
   Click "Add to Cart" on https://harbi.benmina.com

2. FRONTEND (Hostinger)
   ↓
   POST https://your-app.up.railway.app/api/orders
   Headers: { Authorization: "Bearer <token>" }
   Body: { productId: 123, quantity: 2 }

3. BACKEND (Railway)
   ↓
   - Verify JWT token
   - Extract user ID from token
   - Query product from MySQL

4. DATABASE (Hostinger MySQL)
   ↓
   - SELECT * FROM products WHERE id = 123
   - Check stock availability
   - Return product data

5. BACKEND (Railway)
   ↓
   - Create order record
   - INSERT INTO orders (user_id, product_id, ...)
   - Return success response

6. FRONTEND (Hostinger)
   ↓
   - Update cart UI
   - Show "Added to cart" message


┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

FRONTEND
├─ HTTPS only (SSL from Hostinger)
├─ JWT stored in localStorage
└─ API calls include Authorization header

BACKEND
├─ HTTPS only (SSL from Railway)
├─ CORS configured for your domain
├─ Rate limiting (100 req/15min)
├─ Helmet security headers
└─ JWT verification on protected routes

DATABASE
├─ Password protected
├─ Remote access from Railway only
├─ Not exposed to public internet
└─ Accessed only via backend


┌─────────────────────────────────────────────────────────────┐
│                    URL STRUCTURE                             │
└─────────────────────────────────────────────────────────────┘

PUBLIC URLs (Users access these):
├─ https://benmina.com              → Main website
├─ https://harbi.benmina.com        → Your app frontend
└─ https://www.harbi.benmina.com    → Alternative URL

API URLs (Frontend calls these):
├─ https://your-app.up.railway.app/health          → Health check
├─ https://your-app.up.railway.app/api/auth/login  → Login
├─ https://your-app.up.railway.app/api/products    → Get products
├─ https://your-app.up.railway.app/api/orders      → Orders
└─ https://your-app.up.railway.app/api/users/me    → User profile

INTERNAL (Not public):
├─ srv####.hstgr.io:3306  → MySQL (Railway backend only)
└─ localhost:5000         → Backend dev server (local only)


┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW                                 │
└─────────────────────────────────────────────────────────────┘

CODE DEPLOYMENT:
  Your Computer ──git push──> GitHub ──auto deploy──> Railway

FRONTEND ACCESS:
  User Browser ──HTTPS──> Hostinger ──serves──> React App

API REQUESTS:
  React App ──HTTPS API calls──> Railway Backend

DATABASE QUERIES:
  Railway Backend ──MySQL protocol──> Hostinger MySQL

RESPONSES:
  MySQL ──data──> Backend ──JSON──> Frontend ──render──> User


┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT STEPS SUMMARY                  │
└─────────────────────────────────────────────────────────────┘

✅ DONE:
├─ ✓ Frontend hosted on Hostinger (harbi.benmina.com)
├─ ✓ MySQL database created (u894306996_harbi)
├─ ✓ Backend code ready in GitHub
└─ ✓ Configuration files ready (nixpacks.toml, railway.json)

🔄 TODO:
├─ 1. Get MySQL password from Hostinger
├─ 2. Enable Remote MySQL (%)
├─ 3. Upload schema.mysql.sql
├─ 4. Create Railway project
├─ 5. Set environment variables
├─ 6. Get Railway URL
├─ 7. Update frontend API_URL
└─ 8. Test everything

📖 READ THESE IN ORDER:
1. HOSTINGER-MYSQL-INFO.md  → Set up database
2. DEPLOY-NOW.md            → Deploy to Railway
3. RAILWAY-HOSTINGER-SETUP.md → Full guide

🚀 START HERE: HOSTINGER-MYSQL-INFO.md
