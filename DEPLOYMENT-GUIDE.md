# 🚀 DEPLOYMENT CHECKLIST - Hostinger + Railway
## Updated: November 5, 2025

---

## ✅ CONFIGURATION STATUS

### Frontend (Hostinger)
- **URL**: https://harbi.benmina.com
- **API Endpoint**: https://web-production-5b48e.up.railway.app/api

### Backend (Railway)
- **URL**: https://web-production-5b48e.up.railway.app
- **CORS**: Configured for harbi.benmina.com ✅

---

## 📋 STEP-BY-STEP DEPLOYMENT

### 🔷 PART 1: Railway Backend Setup

#### 1. Set Environment Variables in Railway
Go to your Railway project → Variables tab and set these:

```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://harbi.benmina.com
CORS_ORIGIN=https://harbi.benmina.com
JWT_SECRET=<generate-a-long-random-string>
JWT_EXPIRATION=7d
MAX_FILE_SIZE=10485760

# Railway will auto-provide these from MySQL service:
# MYSQL_HOST
# MYSQL_PORT  
# MYSQL_DATABASE
# MYSQL_USER
# MYSQL_PASSWORD
# DATABASE_URL
```

#### 2. Configure Database Connection
Your backend should automatically detect Railway's MySQL variables. Make sure in `server/config/database.js` it's using:
- `process.env.MYSQL_HOST` 
- `process.env.MYSQL_USER`
- `process.env.MYSQL_PASSWORD`
- `process.env.MYSQL_DATABASE`

#### 3. Deploy Backend
- Push your code to GitHub
- Railway should auto-deploy
- Check logs for any errors
- Test endpoint: https://web-production-5b48e.up.railway.app/api/health (if you have a health endpoint)

---

### 🔷 PART 2: Frontend Build & Deploy to Hostinger

#### 1. Build Your Frontend Locally

**Option A: Use the build script (RECOMMENDED)**
```powershell
.\build-for-hostinger.bat
```

**Option B: Manual build**
```powershell
npm install
npm run build
```

This will create a `dist` folder with your production build.

#### 2. Upload to Hostinger

**Via File Manager:**
1. Log in to Hostinger control panel
2. Go to **File Manager**
3. Navigate to your subdomain folder (probably `public_html/harbi` or similar)
4. **DELETE** all existing files in that folder
5. **Upload** ALL files from your local `dist` folder
6. Make sure `.htaccess` file is uploaded (it handles SPA routing)

**Via FTP (Alternative):**
1. Use FileZilla or similar FTP client
2. Connect to your Hostinger FTP
3. Navigate to subdomain folder
4. Upload all `dist` folder contents
5. Ensure `.htaccess` is uploaded

#### 3. Verify .htaccess File
Make sure this file exists in your Hostinger directory:
- Location: `/public_html/harbi/.htaccess` (or your subdomain folder)
- It should already be in your `dist` folder after build

---

### 🔷 PART 3: Testing & Verification

#### Test Checklist:
- [ ] Visit https://harbi.benmina.com - should load without errors
- [ ] Check browser console (F12) - should see API connection logs
- [ ] Test login functionality
- [ ] Test product loading
- [ ] Test image uploads/display
- [ ] Test admin panel access
- [ ] Check mobile responsiveness

#### Common Issues & Fixes:

**❌ "CORS Error"**
- Make sure Railway has `CORS_ORIGIN=https://harbi.benmina.com`
- Check backend logs in Railway
- Verify backend CORS config in `server/server.js`

**❌ "API calls failing"**
- Verify backend is running: https://web-production-5b48e.up.railway.app
- Check Railway logs for errors
- Verify environment variables are set

**❌ "404 on page refresh"**
- Make sure `.htaccess` file is uploaded to Hostinger
- Check Hostinger supports mod_rewrite (it should)

**❌ "Images not loading"**
- Check media endpoint CORS in backend
- Verify image URLs in API responses
- Check browser network tab for failed requests

---

## 🔄 HOW TO UPDATE

### Update Frontend:
```powershell
# Make your changes
git add .
git commit -m "Your changes"

# Build
.\build-for-hostinger.bat

# Upload dist folder to Hostinger
```

### Update Backend:
```powershell
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# Railway auto-deploys from GitHub
```

---

## 📞 Support URLs

- **Frontend**: https://harbi.benmina.com
- **Backend**: https://web-production-5b48e.up.railway.app
- **Railway Dashboard**: https://railway.app
- **Hostinger Panel**: https://hpanel.hostinger.com

---

## 🎯 Quick Commands Reference

```powershell
# Build for production
npm run build

# Test locally before deploy
npm run preview

# Check for errors
npm run build 2>&1 | Select-String "error"
```

---

**✅ All configurations are complete!**
**🚀 You're ready to deploy!**
