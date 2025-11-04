# 🚀 Railway Deployment - FIXED Configuration

## ✅ What Was Fixed

The Railway deployment was pointing to a non-existent `backend/` folder. The actual server code is in `server/` folder.

### Files Updated:
1. **nixpacks.toml** - Updated to use `server/` folder
2. **railway.json** - Updated build and start commands
3. **Procfile** - Updated start command
4. **server.js** - CORS already configured for benmina.com

---

## 🔧 Railway Environment Variables

Go to Railway Dashboard → Your Project → Variables tab and set these:

```bash
# Database (Hostinger MySQL)
DB_HOST=srv1268.hstgr.io
DB_PORT=3306
DB_USER=u894306996_harbi
DB_PASSWORD=<GET_FROM_HOSTINGER_CPANEL>
DB_NAME=u894306996_harbi

# Server Configuration
NODE_ENV=production
PORT=3000

# CORS (Main domain)
CORS_ORIGIN=https://benmina.com

# JWT Secret
JWT_SECRET=<GENERATE_RANDOM_STRING_32_CHARS>

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
```

---

## 📋 Step-by-Step Deployment

### Step 1: Get MySQL Password
1. Log into **Hostinger cPanel**
2. Go to **MySQL Databases**
3. Find user: `u894306996_harbi`
4. **Reset password** if you don't have it
5. **Copy the password** - you'll need it

### Step 2: Upload Database Schema
1. In Hostinger cPanel → **phpMyAdmin**
2. Select database: `u894306996_harbi`
3. Click **Import** tab
4. Upload file: `server/PHPMYADMIN_MIGRATION.sql`
5. Click **Go**

### Step 3: Configure Railway Variables
1. Go to Railway Dashboard
2. Select your project: **houssame-production**
3. Click **Variables** tab
4. Add all variables from above
5. **Important**: Use the password from Step 1

### Step 4: Deploy to Railway
```powershell
git add .
git commit -m "Fix Railway deployment configuration for server folder"
git push origin main
```

Railway will automatically:
- Detect the changes
- Build the server
- Deploy with new configuration
- Takes 1-2 minutes

### Step 5: Test the Deployment
```powershell
# Test health endpoint
curl https://houssame-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Benmina Media API is running",
  "timestamp": "2025-11-04T..."
}
```

---

## 🌐 CORS Configuration

The server is already configured for **benmina.com** as the primary origin:

Allowed origins:
- ✅ `https://benmina.com`
- ✅ `https://www.benmina.com`
- ✅ `http://localhost:5173` (development)

---

## 🔍 Verify Everything Works

### 1. Check Railway Logs
```
Railway Dashboard → Your Service → Logs
```

Look for:
- ✅ "🚀 Benmina Media API server running on port 3000"
- ✅ "📊 Environment: production"
- ✅ "🌐 Allowed Origins: https://benmina.com..."

### 2. Test API Endpoints
```powershell
# Health check
curl https://houssame-production.up.railway.app/api/health

# Test auth endpoint (should return validation errors)
curl -X POST https://houssame-production.up.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{}'
```

### 3. Test from Frontend
Update your frontend API URL to:
```javascript
const API_URL = 'https://houssame-production.up.railway.app/api';
```

---

## ⚡ Quick Checklist

- [ ] MySQL password obtained from Hostinger
- [ ] Database schema uploaded via phpMyAdmin
- [ ] All Railway environment variables set
- [ ] Code committed and pushed to GitHub
- [ ] Railway deployment successful (check logs)
- [ ] Health endpoint returns 200 OK
- [ ] Frontend can communicate with backend

---

## 🆘 Troubleshooting

### Issue: 502 Bad Gateway
**Cause**: Server not starting or crashed
**Fix**: Check Railway logs for errors

### Issue: Database connection failed
**Cause**: Wrong DB_HOST or DB_PASSWORD
**Fix**: 
1. Verify `DB_HOST=srv1268.hstgr.io` (check Hostinger → Remote MySQL)
2. Verify password is correct
3. Ensure Remote MySQL Access Host is set to `%`

### Issue: CORS errors
**Cause**: Frontend domain not in allowed origins
**Fix**: Update `server.js` line 28-35 to include your domain

---

## 📞 Support

If you encounter issues:
1. Check Railway logs first
2. Verify all environment variables
3. Test database connection separately
4. Check Hostinger MySQL remote access settings

---

**Last Updated**: November 4, 2025
**Railway Domain**: houssame-production.up.railway.app
**Frontend Domain**: benmina.com
**Database**: Hostinger MySQL (u894306996_harbi)
