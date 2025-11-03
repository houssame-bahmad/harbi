# 🚂 Railway Environment Variables Setup

## Your Database Info (Hostinger MySQL)
- **Host:** 212.1.211.51
- **Port:** 3306
- **Database:** u894306996_harbi
- **User:** u894306996_harbi
- **Password:** 9Amer.3lih

## Required Environment Variables for Railway

Go to your Railway project → Variables tab → Add these:

```bash
# Database Configuration
DB_HOST=212.1.211.51
DB_PORT=3306
DB_NAME=u894306996_harbi
DB_USER=u894306996_harbi
DB_PASSWORD=9Amer.3lih

# CORS Configuration
CORS_ORIGIN=https://harbi.benmina.com

# JWT Configuration
JWT_SECRET=9c3f0a69446bdf1b707585dab66a8dc974a26500992a2692a8d117047d1595d6
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=production
PORT=3000

# Rate Limiting (optional - defaults are fine)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📋 Setup Steps

### 1. Add Environment Variables
1. Go to https://railway.app
2. Click on your `harbi` project
3. Click on your service
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add each variable above (one by one)
7. Railway will automatically redeploy

### 2. Wait for Deployment
- Railway will redeploy automatically after adding variables
- Wait 2-3 minutes for deployment to complete
- Check the **Deployments** tab for status

### 3. Test Backend Connection

Once deployed, test these URLs in your browser:

**Health Check:**
```
https://harbi-production.up.railway.app/health
```
Should return: `{"status":"ok","timestamp":"..."}`

**If you get an error:**
- Check Railway Logs (click on your service → Logs tab)
- Look for database connection errors
- Verify all environment variables are set correctly

### 4. Run Database Migration

After backend is running, you need to create the database tables. You have 3 options:

#### Option A: Using Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migration
railway run npm run migrate
```

#### Option B: Using phpMyAdmin on Hostinger
1. Login to Hostinger cPanel
2. Go to phpMyAdmin
3. Select database: `u894306996_harbi`
4. Go to SQL tab
5. Copy and paste contents from: `backend/db/schema.mysql.sql`
6. Click **Go**
7. Then paste contents from: `backend/db/seed.mysql.sql`
8. Click **Go**

#### Option C: Direct MySQL Connection
Use MySQL Workbench or similar tool:
- Host: 212.1.211.51
- Port: 3306
- User: u894306996_harbi
- Password: 9Amer.3lih
- Database: u894306996_harbi

Run the SQL files:
1. `backend/db/schema.mysql.sql`
2. `backend/db/seed.mysql.sql`

### 5. Test Backend API

After migration, test the API:

**Get Products:**
```
https://harbi-production.up.railway.app/api/products
```
Should return: Empty array `[]` or list of products

**Login (using Postman or curl):**
```bash
curl -X POST https://harbi-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 6. Upload Frontend to Hostinger

After backend is working:
1. Go to Hostinger File Manager
2. Navigate to `public_html/harbi.benmina.com`
3. Delete old files (keep .htaccess if exists)
4. Upload all files from `C:\Users\bahma\Desktop\parapharmacie-store\dist\`
5. Test: https://harbi.benmina.com

## 🔍 Troubleshooting

### Frontend can't connect to backend

**Check 1: Railway is running**
- Visit https://harbi-production.up.railway.app/health
- Should see: `{"status":"ok",...}`

**Check 2: CORS is configured**
- Make sure `CORS_ORIGIN=https://harbi.benmina.com` is set in Railway
- Redeploy if you just added it

**Check 3: Frontend has correct URL**
- Check browser console (F12)
- Look for network errors
- Verify requests go to `https://harbi-production.up.railway.app/api`

**Check 4: Database is accessible**
- Railway logs should NOT show database connection errors
- Test MySQL connection from Railway: `railway run node -e "console.log('DB_HOST:', process.env.DB_HOST)"`

### Database connection errors in Railway logs

**Error: "Access denied for user"**
- Double-check DB_USER and DB_PASSWORD in Railway
- Make sure no extra spaces

**Error: "Can't connect to MySQL server"**
- Check DB_HOST is 212.1.211.51 (not localhost)
- Check DB_PORT is 3306
- Verify Hostinger allows external connections (usually yes for their MySQL)

**Error: "Unknown database"**
- Verify DB_NAME is exactly: u894306996_harbi
- Check database exists in phpMyAdmin

### Frontend shows "Network Error" or "Failed to fetch"

1. **Open Browser Console (F12)**
2. **Go to Network tab**
3. **Try to login or load products**
4. **Check failed requests:**
   - If request goes to wrong URL → Rebuild frontend with correct .env
   - If CORS error → Check CORS_ORIGIN in Railway
   - If 500 error → Check Railway logs for backend error
   - If connection refused → Backend is not running

## ✅ Success Checklist

- [ ] All environment variables added to Railway
- [ ] Railway deployment successful (green checkmark)
- [ ] Health check works: https://harbi-production.up.railway.app/health
- [ ] Database tables created (migration ran successfully)
- [ ] Products API works: https://harbi-production.up.railway.app/api/products
- [ ] Frontend rebuilt with correct VITE_API_URL
- [ ] Frontend uploaded to Hostinger
- [ ] Can access https://harbi.benmina.com
- [ ] Can login from frontend
- [ ] Products load on frontend

## 🎯 Quick Test

Once everything is set up, test the full flow:

1. Visit https://harbi.benmina.com
2. Click "Login"
3. Use: `admin@example.com` / `admin123`
4. Should login successfully and see dashboard

If login fails:
- Open browser console (F12)
- Check for errors
- Verify request goes to Railway URL
- Check Railway logs for backend errors
