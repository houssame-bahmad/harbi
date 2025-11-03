# 🚀 Your Deployment Steps - harbi.benmina.com

## ✅ What You've Done So Far

- ✅ **Frontend deployed**: `harbi.benmina.com`
- ✅ **MySQL database created**: `u894306996_harbi`
- ✅ **Database user**: `u894306996_harbi`

---

## 🎯 Next Steps: Deploy Backend to Railway

### Step 1: Update Frontend to Use Railway Backend URL

First, we need to update your frontend to point to the Railway backend (which we'll deploy next).

**Update `.env` file:**
```env
VITE_API_URL=https://your-backend-app.up.railway.app/api
```

*(We'll get the actual URL after deploying to Railway)*

---

### Step 2: Deploy Backend to Railway

#### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Authorize Railway to access your GitHub account

#### 2.2 Create New Project from GitHub
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose repository: **`houssame-bahmad/harbi`**
4. Railway will start deploying

#### 2.3 Configure Backend Settings
1. Click on your deployed service (should say "backend" or repository name)
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Set it to: `backend`
5. Click **"Save"**

This tells Railway to deploy only the backend folder!

#### 2.4 Add MySQL Database to Railway
1. In your Railway project, click **"+ New"** 
2. Select **"Database"** → **"Add MySQL"**
3. Railway will create a MySQL database
4. The `DATABASE_URL` will be automatically set

#### 2.5 Set Environment Variables
1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"+ New Variable"** and add each of these:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=GENERATE_THIS_SECRET_BELOW
FRONTEND_URL=https://harbi.benmina.com
JWT_EXPIRES_IN=7d
```

**To generate JWT_SECRET**, run this locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` value.

#### 2.6 Generate Domain for Backend
1. Still in your backend service, go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Railway will give you a URL like: `https://your-app.up.railway.app`
5. **Copy this URL!** You'll need it for frontend

#### 2.7 Run Database Migrations

Railway's MySQL is now running. We need to set up tables. Choose one method:

**Option A: Using Railway CLI** (Recommended)
```bash
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project (select your project and backend service)
railway link

# Run migrations
railway run node dist/scripts/migrate.js
```

**Option B: Add Temporary Migration Endpoint**

Add this to `backend/src/server.ts` temporarily (remove after use):

```typescript
// Temporary migration endpoint - REMOVE AFTER FIRST USE
app.get('/api/setup-database', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    
    // Run schema
    const schemaPath = path.join(__dirname, '../db/schema.mysql.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    const statements = schema.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      await connection.query(statement);
    }
    
    // Run seed data
    const seedPath = path.join(__dirname, '../db/seed.mysql.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    const seedStatements = seed.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of seedStatements) {
      await connection.query(statement);
    }
    
    await connection.end();
    
    res.json({ success: true, message: 'Database setup complete!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

Then visit: `https://your-app.up.railway.app/api/setup-database`

**After migration completes, REMOVE this endpoint for security!**

---

### Step 3: Update Frontend with Railway Backend URL

Now that backend is deployed:

1. **Copy your Railway backend URL**: `https://your-app.up.railway.app`

2. **Update `.env` in project root:**
```env
VITE_API_URL=https://your-app.up.railway.app/api
```

3. **Rebuild frontend:**
```bash
npm run build
```

4. **Re-upload to Hostinger:**
   - Go to hPanel → File Manager
   - Navigate to your `harbi.benmina.com` folder (probably `public_html/harbi`)
   - Delete old files (index.html, assets/)
   - Upload new `dist/` contents

---

### Step 4: Update Railway CORS Settings

The backend needs to allow requests from your Hostinger domain:

1. In Railway → Your backend service → **"Variables"**
2. Make sure `FRONTEND_URL` is set to:
```
https://harbi.benmina.com
```
3. Railway will auto-redeploy with new settings

---

### Step 5: Test Everything!

#### Backend Test:
Visit: `https://your-app.up.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T..."
}
```

#### Frontend Test:
1. Visit: `https://harbi.benmina.com`
2. Open browser console (F12)
3. Check for errors
4. Try these features:
   - Browse products
   - Register a new account
   - Login
   - Add items to cart
   - Place an order

---

## 🎉 Final Configuration Summary

### Your Setup:
- **Frontend**: https://harbi.benmina.com (Hostinger)
- **Backend**: https://your-app.up.railway.app (Railway)
- **Database**: MySQL on Railway (managed)

### Environment Variables:

**Frontend `.env`:**
```env
VITE_API_URL=https://your-app.up.railway.app/api
```

**Railway Backend Variables:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<auto-set-by-railway>
JWT_SECRET=<your-generated-secret>
FRONTEND_URL=https://harbi.benmina.com
JWT_EXPIRES_IN=7d
```

---

## 🐛 Troubleshooting

### CORS Errors in Browser Console
- Check `FRONTEND_URL` in Railway variables matches exactly: `https://harbi.benmina.com`
- No trailing slash!
- Redeploy backend if you changed the variable

### Backend 500 Errors
- Check Railway logs: Dashboard → Service → "Deployments" → Click latest → "View Logs"
- Make sure migrations ran successfully
- Verify all environment variables are set

### Database Connection Errors
- Railway MySQL should auto-connect
- Check Railway logs for connection errors
- Verify DATABASE_URL is set (should be automatic)

### Frontend Shows Old API URL
- Make sure you rebuilt frontend: `npm run build`
- Re-uploaded new `dist/` files to Hostinger
- Clear browser cache (Ctrl+Shift+R)

---

## 📋 Quick Checklist

- [ ] Railway account created
- [ ] Backend deployed from GitHub
- [ ] Root directory set to `backend`
- [ ] MySQL database added to Railway
- [ ] All environment variables set
- [ ] JWT_SECRET generated and added
- [ ] Backend domain generated
- [ ] Database migrations completed
- [ ] Backend health check works
- [ ] Frontend .env updated with Railway URL
- [ ] Frontend rebuilt
- [ ] New frontend files uploaded to Hostinger
- [ ] CORS configured (FRONTEND_URL)
- [ ] Website tested and working

---

## 🚀 You're Almost There!

Follow the steps above and your parapharmacie store will be fully live!

**Questions?** Check the main deployment guides:
- `HYBRID-DEPLOY.md` - Complete hybrid deployment guide
- `RAILWAY-DEPLOY.md` - Detailed Railway guide

Good luck! 🎉
