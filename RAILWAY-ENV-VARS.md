# 🔐 RAILWAY ENVIRONMENT VARIABLES - READY TO USE

## ✅ Copy-Paste These into Railway Dashboard

**Go to**: Railway Dashboard → Variables tab → Add/Edit Variables

---

## 📋 Complete Variable List

```
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

---

## 🎯 Key Information

- **Database Host**: `srv1268.hstgr.io` (Hostinger MySQL server)
- **Database Name**: `u894306996_harbi`
- **Database User**: `u894306996_harbi`
- **Database Password**: `9Amer.3lih` ✅ CONFIRMED
- **CORS Origin**: `https://benmina.com` (your frontend domain)
- **JWT Secret**: Secure 64-character random string (generated)
- **Port**: `3000` (Railway will expose this)

---

## 📝 How to Set Variables in Railway

### Option 1: Individual Variables (Recommended)
1. Go to Railway Dashboard
2. Select your project
3. Click **Variables** tab
4. Click **+ New Variable**
5. Add each variable one by one:
   - Variable Name: `DB_HOST`
   - Variable Value: `srv1268.hstgr.io`
   - Click **Add**
6. Repeat for all 11 variables above

### Option 2: Bulk Import
1. Go to Railway Dashboard → Variables
2. Click **Raw Editor** (if available)
3. Paste all variables at once
4. Click **Deploy**

---

## ⚠️ IMPORTANT NOTES

1. **Railway will auto-redeploy** after you save the variables (takes ~30 seconds)
2. The password `9Amer.3lih` is from your Hostinger MySQL database
3. Never commit these values to GitHub (they're in `.env` which is gitignored)
4. The JWT_SECRET is a freshly generated 64-character secure random string

---

## ✅ After Setting Variables

Railway will automatically:
1. Detect the new environment variables
2. Trigger a new deployment
3. Start your server with the correct database credentials
4. Connect to your Hostinger MySQL database

**Check the logs** for:
```
✅ MySQL connection successful
🚀 Benmina Media API server running on port 3000
```

---

## 🧪 Test After Deployment

```powershell
# Test health endpoint
curl https://houssame-production.up.railway.app/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "message": "Benmina Media API is running",
  "timestamp": "2025-11-04T..."
}
```

---

## 🆘 Troubleshooting

### If you still see "Access denied" errors:

1. **Verify password in Hostinger**:
   - cPanel → MySQL Databases → User `u894306996_harbi`
   - Make sure password is exactly: `9Amer.3lih`

2. **Check Railway Variables**:
   - Ensure `DB_PASSWORD=9Amer.3lih` (no extra spaces)
   - Password is case-sensitive

3. **Check Database Host Access**:
   - Hostinger MySQL user `u894306996_harbi` should allow remote connections
   - Access from host: `%` (all IPs) or Railway's IP range

4. **Redeploy manually**:
   - Railway Dashboard → Deployments → Click "Deploy" button

---

## 📊 Database Schema

Don't forget to upload the schema to Hostinger:

1. Hostinger cPanel → phpMyAdmin
2. Select database: `u894306996_harbi`
3. Click **Import** tab
4. Upload: `server/PHPMYADMIN_MIGRATION.sql`
5. Click **Go**

This creates all necessary tables (users, products, orders, etc.)
