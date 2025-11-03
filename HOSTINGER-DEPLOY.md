# 🌐 Hostinger Frontend Deployment Guide

## Overview
Deploy your React frontend to Hostinger shared hosting as static files.

---

## 📋 Prerequisites

- ✅ Hostinger account with hosting plan
- ✅ Backend deployed to Railway (get your API URL)
- ✅ FTP/File Manager access to Hostinger

---

## 🚀 Deployment Steps

### Step 1: Configure Environment for Production

1. **Update `.env` file:**
```env
VITE_API_URL=https://your-backend.up.railway.app/api
```
Replace `your-backend.up.railway.app` with your actual Railway backend URL.

2. **Verify the API URL is correct:**
```powershell
# Test if your backend is accessible
curl https://your-backend.up.railway.app/health
```
Should return: `{"status":"ok"}`

---

### Step 2: Build the Frontend

1. **Install dependencies (if not already done):**
```powershell
npm install
```

2. **Build the production bundle:**
```powershell
npm run build
```

3. **Verify the build:**
- Check that `dist/` folder was created
- Should contain: `index.html`, `assets/` folder with JS and CSS files

---

### Step 3: Deploy to Hostinger

#### Option A: Using File Manager (Easiest)

1. **Login to Hostinger:**
   - Go to https://hpanel.hostinger.com
   - Login with your credentials

2. **Access File Manager:**
   - Click on your hosting plan
   - Click **"File Manager"**

3. **Navigate to public_html:**
   - Go to `public_html` folder (or `public_html/yourdomain.com`)
   - Delete default files (like `index.html`, `default.php`)

4. **Upload Build Files:**
   - Click **"Upload Files"**
   - Select ALL files from your `dist/` folder:
     - `index.html`
     - `assets/` folder (entire folder)
     - `vite.svg` (if present)
   - Wait for upload to complete

5. **Set Proper Permissions:**
   - Select all uploaded files
   - Set permissions to `644` for files
   - Set permissions to `755` for folders

#### Option B: Using FTP/SFTP

1. **Get FTP Credentials:**
   - Hostinger panel → Hosting → FTP Accounts
   - Note: Hostname, Username, Password, Port

2. **Connect using FileZilla or WinSCP:**
   ```
   Host: ftp.yourdomain.com
   Username: your-ftp-username
   Password: your-ftp-password
   Port: 21 (FTP) or 22 (SFTP)
   ```

3. **Upload Files:**
   - Navigate to `public_html` folder on remote
   - Delete existing default files
   - Upload ALL contents of your local `dist/` folder
   - Ensure folder structure is preserved

---

### Step 4: Configure .htaccess for React Router

Create a `.htaccess` file in your `public_html` folder:

**Option A: Create via File Manager**
1. In Hostinger File Manager, click **"New File"**
2. Name it `.htaccess`
3. Add this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
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
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/x-javascript "access plus 1 month"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

**Option B: Upload .htaccess file**
1. Create `.htaccess` file locally with the content above
2. Upload it to `public_html` via File Manager or FTP

---

### Step 5: Update Backend CORS Settings

Your Railway backend needs to allow requests from Hostinger domain.

1. **Get your Hostinger domain:**
   - e.g., `https://yourdomain.com` or `https://yoursite.hostinger.com`

2. **Update Railway environment variables:**
   - Go to Railway dashboard
   - Click on backend service
   - Go to **Variables** tab
   - Update `FRONTEND_URL` to your Hostinger domain:
   ```
   FRONTEND_URL=https://yourdomain.com
   ```
   - Railway will auto-redeploy backend

---

### Step 6: Test Your Deployment

1. **Visit your website:**
   ```
   https://yourdomain.com
   ```

2. **Check homepage loads:**
   - Should see products
   - Hero section displays

3. **Test functionality:**
   - [ ] Products load from backend API
   - [ ] Can browse categories
   - [ ] Can view product details
   - [ ] Can add to cart
   - [ ] Can register new account
   - [ ] Can login
   - [ ] Can create order
   - [ ] Admin panel works (login as admin)

4. **Check browser console:**
   - Press F12 → Console tab
   - Should have NO errors
   - Especially no CORS errors

---

## 🔄 Updating Your Site

When you make changes:

1. **Update code locally**
2. **Build again:**
   ```powershell
   npm run build
   ```
3. **Upload new `dist/` files to Hostinger**
   - Overwrite existing files
   - Clear browser cache to see changes

---

## 🔧 Troubleshooting

### 404 Errors on Page Refresh
**Problem:** Direct URLs like `/cart` return 404

**Solution:** Ensure `.htaccess` file is present and configured correctly
- Check file is named exactly `.htaccess` (with the dot)
- Verify Apache mod_rewrite is enabled (usually enabled on Hostinger)

### CORS Errors
**Problem:** API calls failing with CORS error

**Solutions:**
1. Verify `FRONTEND_URL` in Railway matches your Hostinger domain EXACTLY
2. Check backend logs in Railway
3. Ensure domain doesn't have trailing slash
4. Wait 2-3 minutes after updating Railway variables for redeployment

### Blank Page / White Screen
**Problem:** Site loads but shows nothing

**Solutions:**
1. Check browser console for errors (F12)
2. Verify all files uploaded correctly
3. Check that `assets/` folder is present
4. Verify `.env` has correct `VITE_API_URL`
5. Rebuild with correct environment variables

### API Calls Not Working
**Problem:** Products not loading, can't login

**Solutions:**
1. Check Railway backend is running: `https://your-backend.up.railway.app/health`
2. Verify `VITE_API_URL` in your build
3. Check browser Network tab (F12) for API requests
4. Ensure backend CORS allows your Hostinger domain

### Assets Not Loading (Images, CSS, JS)
**Problem:** Broken styles, missing images

**Solutions:**
1. Check `assets/` folder uploaded completely
2. Verify file permissions: 644 for files, 755 for folders
3. Check browser console for 404 errors
4. Clear browser cache (Ctrl+Shift+R)

---

## 🎯 File Structure on Hostinger

After deployment, your `public_html` should look like:

```
public_html/
├── index.html              # Main HTML file
├── vite.svg               # Icon (if present)
├── .htaccess              # Rewrite rules (IMPORTANT!)
└── assets/
    ├── index-[hash].js    # JavaScript bundle
    ├── index-[hash].css   # CSS bundle
    └── [other assets]
```

---

## 💡 Performance Tips

### Enable Compression
Already included in `.htaccess` above (GZIP compression)

### Enable Caching
Already included in `.htaccess` above (Browser caching)

### Use Cloudflare (Optional)
1. Add your domain to Cloudflare (free)
2. Point DNS to Hostinger
3. Enable CDN and caching
4. Improves speed globally

### Optimize Images
Before building:
1. Compress images using TinyPNG or similar
2. Use modern formats (WebP)
3. Lazy load images

---

## 📊 Hostinger-Specific Settings

### PHP Version
Not needed (static React app), but if required:
- Hostinger panel → Advanced → PHP Configuration
- Set to PHP 8.x for best compatibility

### SSL Certificate
1. Hostinger panel → Security → SSL
2. Install free SSL certificate
3. Force HTTPS redirect (usually automatic)

### Custom Domain
1. Hostinger panel → Domains
2. Point domain to your hosting
3. Wait for DNS propagation (up to 48 hours)
4. Update `FRONTEND_URL` in Railway

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Railway backend URL obtained
- [ ] `.env` updated with Railway API URL
- [ ] `npm run build` executed successfully
- [ ] All files from `dist/` uploaded to Hostinger
- [ ] `.htaccess` file created and configured
- [ ] File permissions set correctly
- [ ] `FRONTEND_URL` updated in Railway backend
- [ ] Website loads at domain
- [ ] Products load from backend
- [ ] Login/Register works
- [ ] Cart functionality works
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] No CORS errors
- [ ] All pages accessible (no 404 on refresh)

---

## 🎉 Success!

Your Parapharmacie Store is now live on Hostinger! 🚀

**Your Live Site:** `https://yourdomain.com`

**Architecture:**
- ✅ Frontend: Hostinger (Static React app)
- ✅ Backend: Railway (Express API)
- ✅ Database: Railway (PostgreSQL)

---

## 📞 Support

**Hostinger Support:**
- Live Chat: Available 24/7 in hPanel
- Knowledge Base: https://support.hostinger.com

**Project Documentation:**
- DEPLOYMENT.md - General deployment guide
- RAILWAY-DEPLOY.md - Railway backend guide
- DEPLOYMENT-CHECKLIST.md - Complete checklist

---

## 🔄 Continuous Deployment

For easier updates in the future, consider:

1. **Create a deploy script** (`deploy.sh`):
```bash
npm run build
# Upload dist/ to Hostinger via FTP
```

2. **Or use GitHub Actions** to auto-deploy on push
3. **Or use Hostinger Git integration** (if available on your plan)

---

**Your site is ready for customers!** 🎊
