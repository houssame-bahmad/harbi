# 🚀 Hybrid Deployment Guide
## Frontend: Hostinger Subdomain | Backend: Railway | Database: Railway MySQL

**Best of both worlds:** Professional subdomain for your store + Powerful Railway backend with managed database!

---

## 📋 Deployment Overview

- **Frontend**: `store.yourdomain.com` (Hostinger subdomain)
- **Backend**: `your-app.up.railway.app` (Railway)
- **Database**: MySQL on Railway (free managed database)

**Total Time**: ~25 minutes

---

## 🎯 Part 1: Deploy Backend to Railway (10 minutes)

### Step 1.1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### Step 1.2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose repository: `houssame-bahmad/harbi`
4. Railway will detect your code

### Step 1.3: Configure Root Directory
1. In project settings → **Service Settings**
2. Find **"Root Directory"**
3. Set to: `backend`
4. Save changes

### Step 1.4: Add MySQL Database
1. Click **"+ New"** → **"Database"** → **"Add MySQL"**
2. Railway automatically creates a MySQL database
3. Database credentials are auto-injected as environment variables

### Step 1.5: Set Environment Variables
1. Click your backend service → **"Variables"** tab
2. Add these variables:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<GENERATE_SECURE_SECRET>
FRONTEND_URL=https://store.yourdomain.com
JWT_EXPIRES_IN=7d
```Password

**To generate JWT_SECRET**, run locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Note**: `DATABASE_URL` (MySQL connection string) is automatically set by Railway when you add MySQL!

### Step 1.6: Deploy Backend
1. Railway will automatically deploy
2. Wait for build to complete (~2-3 minutes)
3. Click **"Settings"** → **"Networking"** → **"Generate Domain"**
4. Copy your backend URL: `https://your-app.up.railway.app`

### Step 1.7: Run Database Migrations
1. In Railway dashboard → Your backend service → **"Settings"**
2. Scroll to **"Deploy Triggers"**
3. Add custom start command (optional) or use Railway CLI:

**Option A: Using Railway CLI** (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run node dist/scripts/migrate.js
```

**Option B: Using Database Connection**
1. Get database credentials from Railway (Variables tab)
2. Use a MySQL client (MySQL Workbench, DBeaver, phpMyAdmin, etc.)
3. Connect remotely and run the SQL from `backend/db/schema.mysql.sql` and `backend/db/seed.mysql.sql`

**Option C: Temporary Migration Endpoint** (Quick & Easy)
Add this to your backend temporarily, then remove after migration:
```typescript
// In src/server.ts (temporary - remove after use!)
app.get('/api/migrate', async (req, res) => {
  try {
    const { migrate } = await import('./scripts/migrate.js');
    await migrate();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```
Then visit: `https://your-app.up.railway.app/api/migrate`

### Step 1.8: Test Backend
Visit: `https://your-app.up.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T..."
}
```

✅ **Backend deployed on Railway!**

---

## 🌐 Part 2: Deploy Frontend to Hostinger Subdomain (15 minutes)

### Step 2.1: Create Subdomain in Hostinger
1. Log in to **Hostinger hPanel**
2. Go to **Domains** → **Subdomains**
3. Click **"Create Subdomain"**
4. Enter subdomain name: `store` (or `shop`, `parapharmacie`, etc.)
5. Click **Create**
6. Note the path: usually `public_html/store` or `domains/yourdomain.com/public_html/store`

### Step 2.2: Update Frontend Environment
**Edit `.env` in your project root:**
```env
VITE_API_URL=https://your-app.up.railway.app/api
```

Replace `your-app.up.railway.app` with your actual Railway URL!

### Step 2.3: Build Frontend
```bash
# In project root (NOT backend folder)
npm run build
```

This creates a `dist` folder with your production-ready frontend.

### Step 2.4: Upload Frontend to Hostinger

**Using File Manager (Easy):**
1. In hPanel → **File Manager**
2. Navigate to your subdomain folder: `public_html/store`
3. Delete any default files (index.html, etc.)
4. Upload **ALL contents** from your local `dist` folder:
   - `index.html`
   - `assets/` folder (with all CSS/JS files)

**Using FTP/SFTP (Alternative):**
1. Get FTP credentials from hPanel → **File Manager** → **FTP Accounts**
2. Use FileZilla or similar:
   - Host: `ftp.yourdomain.com` or IP from hPanel
   - Username: Your FTP user
   - Password: Your FTP password
   - Port: 21 (FTP) or 22 (SFTP)
3. Upload `dist/*` to `public_html/store/`

### Step 2.5: Create .htaccess for React Router

In `public_html/store`, create a file named `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### Step 2.6: Enable SSL Certificate
1. In hPanel → **Security** → **SSL**
2. Find your subdomain `store.yourdomain.com`
3. Click **Install SSL** (Hostinger provides free Let's Encrypt SSL)
4. Enable **Force HTTPS** (redirects HTTP to HTTPS)
5. Wait 5-10 minutes for SSL to activate

### Step 2.7: Update Railway Backend CORS
1. Go back to Railway dashboard
2. Click your backend service → **Variables**
3. Update `FRONTEND_URL`:
```env
FRONTEND_URL=https://store.yourdomain.com
```
4. Railway will automatically redeploy

### Step 2.8: Test Frontend
1. Visit: `https://store.yourdomain.com`
2. Open browser console (F12)
3. Check for errors:
   - ✅ No CORS errors
   - ✅ No 404 errors
   - ✅ API calls working

✅ **Frontend deployed on Hostinger subdomain!**

---

## 🧪 Part 3: Complete Testing (5 minutes)

### Backend Tests
- [ ] Health endpoint works: `https://your-app.up.railway.app/api/health`
- [ ] Products endpoint: `https://your-app.up.railway.app/api/products`
- [ ] Database connected (no connection errors in Railway logs)
- [ ] CORS allows requests from `store.yourdomain.com`

### Frontend Tests
- [ ] Website loads: `https://store.yourdomain.com`
- [ ] SSL certificate shows padlock 🔒
- [ ] Products load from Railway API
- [ ] No CORS errors in console
- [ ] Can navigate between pages (no 404s)
- [ ] Login/Register works
- [ ] Can add items to cart
- [ ] Can place orders

### Integration Tests
- [ ] Login with test account works
- [ ] Create new user account
- [ ] Browse products
- [ ] Add to cart
- [ ] Place an order
- [ ] Check order in "My Orders"
- [ ] Admin can see orders (if admin account exists)

---

## 📊 Configuration Summary

### Railway Backend (.env)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<auto-set-by-railway-mysql>
JWT_SECRET=<your-generated-secret>
FRONTEND_URL=https://store.yourdomain.com
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```env
VITE_API_URL=https://your-app.up.railway.app/api
```

### Hostinger Subdomain Structure
```
public_html/
└── store/                    ← Your subdomain folder
    ├── index.html           ← Main HTML file
    ├── .htaccess            ← React Router config
    └── assets/              ← CSS, JS, images
        ├── index-abc123.js
        ├── index-xyz789.css
        └── ...
```

---

## 🔄 Updating Your Application

### Update Backend (Railway)
1. Make changes locally in `backend/` folder
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
3. Railway automatically redeploys! ✨

### Update Frontend (Hostinger)
1. Make changes locally
2. Update `.env` if needed (ensure VITE_API_URL is correct)
3. Build:
   ```bash
   npm run build
   ```
4. Upload new `dist/` contents to `public_html/store` via File Manager or FTP
5. Clear browser cache to see changes

---

## 🐛 Troubleshooting

### CORS Errors
**Error**: "Access to fetch at 'https://...' from origin 'https://store.yourdomain.com' has been blocked by CORS"

**Solution**:
1. Check Railway Variables → `FRONTEND_URL` matches exactly: `https://store.yourdomain.com`
2. Ensure no trailing slash in FRONTEND_URL
3. Check Railway logs for CORS middleware errors
4. Redeploy Railway backend if needed

### Backend 500 Errors
**Error**: API returns 500 Internal Server Error

**Solutions**:
1. Check Railway logs (Dashboard → Service → Logs)
2. Database not migrated? Run migrations
3. Missing environment variables? Check all variables set
4. Database connection issue? Check DATABASE_URL

### Frontend Blank Page
**Error**: White screen, nothing loads

**Solutions**:
1. Check browser console for errors (F12)
2. Verify `VITE_API_URL` was correct when you built
3. Rebuild frontend with correct URL
4. Check `.htaccess` file exists
5. Clear browser cache (Ctrl+Shift+R)

### 404 on Page Refresh
**Error**: Refreshing `/products` gives 404

**Solution**:
- Missing or incorrect `.htaccess` file
- Re-upload `.htaccess` to `public_html/store`
- Ensure mod_rewrite is enabled (usually is on Hostinger)

### SSL Not Working
**Error**: "Not Secure" warning

**Solutions**:
1. Wait 5-10 minutes after SSL installation
2. Force HTTPS in SSL settings
3. Clear browser cache
4. Check SSL certificate status in hPanel

### Database Connection Failed
**Error**: Railway can't connect to database

**Solutions**:
1. Ensure PostgreSQL service is running in Railway
2. Check DATABASE_URL is set (should be automatic)
3. Verify database and backend are in same project
4. Check Railway logs for specific error

---

## 💡 Pro Tips

### Performance Optimization
1. **Enable Cloudflare** (free) for your domain:
   - Faster global CDN
   - Better DDoS protection
   - Free SSL

2. **Optimize Images**: Use WebP format, compress images before upload

3. **Monitor Railway Usage**: Free tier has limits, upgrade if needed

4. **MySQL Optimization**: Add indexes on frequently queried columns (already done in schema)

### Security Best Practices
1. **Rotate JWT_SECRET** periodically
2. **Use strong database passwords** (Railway generates these)
3. **Enable Railway's** built-in DDoS protection
4. **Regular backups**: Export database from Railway periodically

### Cost Management
- **Railway Free Tier**: $5 credit/month, usually enough for small apps
- **Hostinger**: Already paid for with your hosting plan
- **Scale up**: Upgrade Railway if you exceed free tier

---

## 📦 Quick Reference

### Important URLs
- **Frontend**: `https://store.yourdomain.com`
- **Backend API**: `https://your-app.up.railway.app/api`
- **Health Check**: `https://your-app.up.railway.app/api/health`
- **Railway Dashboard**: https://railway.app/dashboard
- **Hostinger hPanel**: https://hpanel.hostinger.com

### Quick Commands

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Build Frontend**:
```bash
npm run build
```

**Build Backend** (locally, for testing):
```bash
cd backend
npm run build
```

**View Railway Logs**:
```bash
railway logs
```

---

## ✅ Deployment Checklist

### Railway Backend Setup
- [ ] Created Railway account
- [ ] Deployed from GitHub repository
- [ ] Set root directory to `backend`
- [ ] Added PostgreSQL database
- [ ] Set all environment variables
- [ ] Generated domain/URL
- [ ] Ran database migrations
- [ ] Tested health endpoint
- [ ] Verified CORS settings

### Hostinger Frontend Setup
- [ ] Created subdomain in hPanel
- [ ] Updated `.env` with Railway URL
- [ ] Built frontend with `npm run build`
- [ ] Uploaded all `dist/` contents
- [ ] Created `.htaccess` file
- [ ] Enabled SSL certificate
- [ ] Forced HTTPS redirect
- [ ] Tested website loads
- [ ] Verified no CORS errors

### Final Verification
- [ ] Can register new account
- [ ] Can login
- [ ] Products display correctly
- [ ] Can add to cart
- [ ] Can place order
- [ ] Order appears in "My Orders"
- [ ] Admin features work (if applicable)
- [ ] All pages accessible
- [ ] No console errors

---

## 🎉 Success!

Your parapharmacie store is now live!

- **Customers visit**: `https://store.yourdomain.com`
- **API powered by**: Railway PostgreSQL
- **Secure, scalable, professional!**

### Next Steps
1. Add products via admin panel
2. Test full order workflow
3. Share your store URL
4. Monitor Railway usage
5. Set up analytics (Google Analytics, etc.)

---

## 📚 Additional Resources

- **Railway Docs**: https://docs.railway.app
- **Hostinger Knowledge Base**: https://support.hostinger.com
- **Your Backend Code**: `backend/README.md`
- **Other Guides**:
  - `RAILWAY-DEPLOY.md` - Detailed Railway guide
  - `HOSTINGER-DEPLOY.md` - Detailed Hostinger guide
  - `DEPLOYMENT-CHECKLIST.md` - General deployment checklist

Need help? Check the troubleshooting section or consult the docs above!
