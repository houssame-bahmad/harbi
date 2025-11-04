# ✅ RAILWAY DEPLOYMENT - COMPLETE SETUP GUIDE

## 🎯 What Was Done

Fixed Railway deployment configuration to use the correct `server/` folder (was incorrectly pointing to `backend/` which didn't exist).

### Files Fixed:
- ✅ `nixpacks.toml` - Updated to build and run from `server/`
- ✅ `railway.json` - Updated start command and health check path
- ✅ `Procfile` - Updated start command
- ✅ Removed nested git repository from `server/` folder
- ✅ Committed and pushed to GitHub

---

## 🚀 NEXT STEPS - DO THIS NOW!

### Step 1: Set Railway Environment Variables ⚡

**Go to**: Railway Dashboard → Your Project → Variables tab

**Add these variables** (copy-paste each one):

```bash
DB_HOST=srv1268.hstgr.io
DB_PORT=3306
DB_USER=u894306996_harbi
DB_PASSWORD=9Amer.3lih
DB_NAME=u894306996_harbi
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://harbi.benmina.com
JWT_SECRET=sUGlrISfJv2wMkHy6iB7tTbYju5g3WCNLOzm9q18o0EFVPnZKQcDX4paRxedhA
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=500
```

**✅ PASSWORD CONFIRMED**: Using `9Amer.3lih` (from your Hostinger MySQL)
**✅ CORS ORIGIN**: Set to `https://harbi.benmina.com` (your frontend subdomain)

---

### Step 2: Get MySQL Password from Hostinger

1. Log into **Hostinger cPanel**
2. Click **"MySQL Databases"**
3. Scroll to **"Current Users"**
4. Find user: `u894306996_harbi`
5. Click **"Change Password"** or note existing password
6. **Copy the password**
7. Go back to Railway and update `DB_PASSWORD` variable

---

### Step 3: Upload Database Schema

1. In Hostinger cPanel → **phpMyAdmin**
2. Select database: `u894306996_harbi`
3. Click **"Import"** tab
4. Click **"Choose File"**
5. Select: `server/PHPMYADMIN_MIGRATION.sql` from your project
6. Click **"Go"** button at bottom
7. Wait for "Import has been successfully finished"

---

### Step 4: Monitor Railway Deployment

Railway should automatically detect your pushed changes and redeploy.

**Check deployment**:
1. Go to Railway Dashboard
2. Click on your project
3. Look at **"Deployments"** tab
4. Wait for status to show **"Success"** (takes 1-2 minutes)

**Watch logs**:
- Click on the active deployment
- View logs for any errors
- Look for: "🚀 Benmina Media API server running on port 3000"

---

### Step 5: Test Your Backend

```powershell
# Test health endpoint
curl https://houssame-production.up.railway.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Benmina Media API is running",
  "timestamp": "2025-11-04T12:34:56.789Z"
}
```

**If you get 502 error**: Wait 30 more seconds and try again. Railway may still be deploying.

---

## 🔍 Verify Everything

### ✅ Checklist:

- [ ] All Railway environment variables set (especially DB_PASSWORD)
- [ ] Database schema uploaded to Hostinger MySQL
- [ ] Railway deployment shows "Success"
- [ ] Health endpoint returns 200 OK
- [ ] No errors in Railway logs

---

## 🌐 Frontend Configuration

Your frontend API should point to:
```
https://houssame-production.up.railway.app/api
```

Update `services/api.ts`:
```typescript
const API_URL = 'https://houssame-production.up.railway.app/api';
```

Then rebuild and redeploy your frontend to Hostinger.

---

## 📊 Current Setup

| Component | Location | Domain |
|-----------|----------|--------|
| **Frontend** | Hostinger | benmina.com |
| **Backend** | Railway | houssame-production.up.railway.app |
| **Database** | Hostinger MySQL | u894306996_harbi |

---

## 🆘 Troubleshooting

### Issue: 502 Bad Gateway after deployment

**Causes:**
1. Server still starting (wait 1-2 minutes)
2. Database connection failed (wrong password or host)
3. Missing environment variables

**Fix:**
1. Check Railway logs for specific error
2. Verify all environment variables are set
3. Ensure DB_PASSWORD is correct
4. Check DB_HOST is `srv1268.hstgr.io`

### Issue: "Access denied for user"

**Cause**: Wrong MySQL password or remote access not enabled

**Fix:**
1. Reset password in Hostinger → MySQL Databases
2. In Hostinger → Remote MySQL, ensure Access Host is `%`
3. Update DB_PASSWORD in Railway

### Issue: "Table doesn't exist"

**Cause**: Database schema not uploaded

**Fix:**
1. Go to Hostinger phpMyAdmin
2. Import `server/PHPMYADMIN_MIGRATION.sql`

---

## 📞 Need Help?

1. **Check Railway Logs first** - They show the exact error
2. **Verify environment variables** - Most issues are here
3. **Test database connection** - Use Hostinger phpMyAdmin
4. **Check CORS** - Ensure benmina.com is allowed

---

**Deployment Status**: ✅ Code pushed to GitHub, awaiting Railway variables
**Next Action**: Set environment variables in Railway Dashboard
**Estimated Time**: 5 minutes to complete setup

---

**Last Updated**: November 4, 2025
**Railway Domain**: houssame-production.up.railway.app
**GitHub**: houssame-bahmad/harbi
