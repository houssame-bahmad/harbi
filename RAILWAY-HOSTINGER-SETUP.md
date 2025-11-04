# Railway + Hostinger Deployment Guide

## 🎯 Overview
- **Frontend**: Hostinger → `harbi.benmina.com`
- **Backend**: Railway → Your backend API
- **Database**: Hostinger MySQL → `u894306996_harbi`

---

## 📋 Step 1: Deploy Backend to Railway

### 1.1 Create New Project
1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `houssame-bahmad/harbi`
5. Click **"Deploy Now"**

### 1.2 Configure Environment Variables
In Railway dashboard, go to your project → **Variables** tab and add:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration (Hostinger MySQL)
DB_HOST=srv1268.hstgr.io
DB_PORT=3306
DB_USER=u894306996_harbi
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=u894306996_harbi

# CORS Configuration
CORS_ORIGIN=https://harbi.benmina.com

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
```

⚠️ **IMPORTANT**: You need to get your MySQL password from Hostinger cPanel → MySQL Databases

---

## 📋 Step 2: Get Hostinger MySQL Details

### 2.1 Find MySQL Host
1. Log into Hostinger cPanel
2. Go to **MySQL Databases**
3. Find "Remote MySQL" section
4. The host is usually: `srvXXXX.hstgr.io` (where XXXX is a number)
5. Common hosts:
   - `srv1268.hstgr.io`
   - `localhost` (if Railway is whitelisted)

### 2.2 Get MySQL Password
1. In cPanel → **MySQL Databases**
2. Find user: `u894306996_harbi`
3. If you don't have the password, create a new one:
   - Click **"Change Password"** next to the user
   - Generate or set a strong password
   - **SAVE THIS PASSWORD** - you'll need it for Railway

### 2.3 Allow Remote Access
1. In cPanel → **Remote MySQL**
2. Add Railway's IP to whitelist:
   - Option 1: Add `%` (allows all - less secure but easier)
   - Option 2: Get Railway's static IPs and whitelist them

---

## 📋 Step 3: Initialize Database Schema

### 3.1 Upload Schema to Hostinger
1. In cPanel → **phpMyAdmin**
2. Select database: `u894306996_harbi`
3. Click **"Import"** tab
4. Upload: `backend/db/schema.mysql.sql`
5. Click **"Go"**

### 3.2 Seed Initial Data (Optional)
1. In phpMyAdmin, same database
2. Click **"Import"** tab
3. Upload: `backend/db/seed.mysql.sql`
4. Click **"Go"**

---

## 📋 Step 4: Generate JWT Secret

Run this command in PowerShell to generate a secure JWT secret:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Copy the output and use it as your `JWT_SECRET` in Railway.

---

## 📋 Step 5: Deploy and Get Backend URL

### 5.1 Wait for Deployment
1. Railway will automatically deploy after you add env variables
2. Check the **"Deployments"** tab for status
3. Wait for ✅ **"Success"**

### 5.2 Get Your Backend URL
1. In Railway project → **"Settings"** tab
2. Click **"Generate Domain"**
3. You'll get a URL like: `your-app-name.up.railway.app`
4. **SAVE THIS URL** - you'll need it for frontend

### 5.3 Test Backend
Visit: `https://your-app-name.up.railway.app/health`

You should see:
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-11-03T..."
}
```

---

## 📋 Step 6: Update Frontend Configuration

### 6.1 Update API URL in Frontend
1. Go to your frontend code
2. Find `services/api.ts` or where API_URL is defined
3. Update to your Railway backend URL:

```typescript
const API_URL = 'https://your-app-name.up.railway.app';
```

### 6.2 Upload to Hostinger
1. Build your frontend: `npm run build`
2. Upload the `dist` folder to Hostinger
3. Path: `public_html/harbi` (for subdomain)

---

## 📋 Step 7: Update Backend CORS

After you get your Railway URL, update CORS in Railway variables:

```env
CORS_ORIGIN=https://harbi.benmina.com,https://benmina.com,https://www.benmina.com
```

Or update `backend/src/server.ts` if you want to hardcode them.

---

## 🧪 Testing Your Setup

### Test Database Connection
```bash
# From your local machine
node backend/test-db-connection.js
```

### Test Backend Endpoints
```bash
# Health check
curl https://your-app-name.up.railway.app/health

# Get products
curl https://your-app-name.up.railway.app/api/products

# Register user
curl -X POST https://your-app-name.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'
```

---

## 🔧 Environment Variables Summary

### Railway Backend Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Environment |
| `PORT` | `5000` | Railway auto-assigns, but set for clarity |
| `DB_HOST` | `srv1268.hstgr.io` | Your Hostinger MySQL host |
| `DB_PORT` | `3306` | Standard MySQL port |
| `DB_USER` | `u894306996_harbi` | Your MySQL user |
| `DB_PASSWORD` | `***` | Get from Hostinger |
| `DB_NAME` | `u894306996_harbi` | Your database name |
| `CORS_ORIGIN` | `https://harbi.benmina.com` | Your frontend URL |
| `JWT_SECRET` | `***` | Generate random 32+ chars |

---

## 🚨 Troubleshooting

### Backend won't start
1. Check Railway logs: **"Deployments"** → Click on deployment → **"View Logs"**
2. Common issues:
   - Missing environment variables
   - Wrong MySQL credentials
   - Database connection timeout

### Database connection fails
1. Verify MySQL host in Hostinger
2. Check if Remote MySQL is enabled
3. Verify password is correct
4. Check if `%` is allowed in Remote MySQL access hosts

### CORS errors on frontend
1. Verify `CORS_ORIGIN` in Railway includes your domain
2. Check browser console for exact error
3. Ensure no trailing slashes in URLs

### 502 Bad Gateway
1. Check if backend is running in Railway logs
2. Verify `start` command is correct
3. Check if PORT is properly configured

---

## 📝 Quick Start Commands

```powershell
# Test local backend build
cd backend
npm run build

# Generate JWT secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Build frontend
npm run build

# Deploy to git (triggers Railway)
git add .
git commit -m "Configure for Railway + Hostinger"
git push origin main
```

---

## ✅ Deployment Checklist

- [ ] Railway project created
- [ ] All environment variables set in Railway
- [ ] MySQL host found in Hostinger
- [ ] MySQL password obtained
- [ ] Remote MySQL access enabled (% allowed)
- [ ] Database schema uploaded via phpMyAdmin
- [ ] Seed data uploaded (optional)
- [ ] Railway deployment successful
- [ ] Railway domain generated
- [ ] Backend health endpoint works
- [ ] Frontend updated with backend URL
- [ ] Frontend rebuilt and uploaded to Hostinger
- [ ] CORS configured correctly
- [ ] Test user registration works
- [ ] Test login works
- [ ] Test product fetching works

---

## 🎉 You're Done!

Your app should now be live:
- **Frontend**: https://harbi.benmina.com
- **Backend**: https://your-app-name.up.railway.app
- **Database**: Hostinger MySQL

---

## 📞 Need Help?

Common issues and solutions are in the troubleshooting section above. Check Railway logs for detailed error messages.
