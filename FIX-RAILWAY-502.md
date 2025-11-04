# 🔧 RAILWAY BACKEND - 502 ERROR FIX

## ⚠️ Current Issue
Your Railway backend is deployed but returning 502 error.
This means the app isn't starting properly.

## ✅ CHECKLIST - Verify These in Railway

### 1. Go to Railway Dashboard
https://railway.app → Your Project → houssame-production

### 2. Click "Variables" Tab
Verify ALL these variables are set:

```env
NODE_ENV=production
PORT=5000
DB_HOST=srv1268.hstgr.io
DB_PORT=3306
DB_USER=u894306996_harbi
DB_PASSWORD=[YOUR_ACTUAL_PASSWORD]
DB_NAME=u894306996_harbi
CORS_ORIGIN=https://harbi.benmina.com
JWT_SECRET=[32+ RANDOM CHARS]
```

### 3. Most Common Issues:

#### ❌ Missing DB_PASSWORD
- Go to Hostinger cPanel → MySQL Databases
- Find user: u894306996_harbi
- Reset password if needed
- Copy it to Railway DB_PASSWORD

#### ❌ Wrong DB_HOST
- Go to Hostinger cPanel → Remote MySQL
- Find your host (usually srv####.hstgr.io)
- Update DB_HOST in Railway

#### ❌ Remote MySQL Not Enabled
- Hostinger cPanel → Remote MySQL
- Add Access Host: `%`
- This allows Railway to connect

#### ❌ Missing JWT_SECRET
- Generate with PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```
- Copy to Railway JWT_SECRET

### 4. Check Railway Logs

**In Railway Dashboard:**
1. Click on your service
2. Click "Deployments" tab
3. Click on latest deployment
4. Click "View Logs"

**Look for errors like:**
- `ER_ACCESS_DENIED_ERROR` → Wrong DB password
- `ENOTFOUND` → Wrong DB_HOST
- `ETIMEDOUT` → Remote MySQL not enabled
- `JWT_SECRET is required` → Missing JWT_SECRET

### 5. After Fixing Variables

Railway will automatically redeploy. Wait 1-2 minutes, then test:

```powershell
curl https://houssame-production.up.railway.app/health
```

**Should return:**
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "2025-11-03T..."
}
```

---

## 🎯 Quick Fix Steps

1. **Get MySQL Password:**
   - Hostinger cPanel → MySQL Databases
   - User: u894306996_harbi
   - Note/reset password

2. **Enable Remote MySQL:**
   - Hostinger cPanel → Remote MySQL
   - Add: `%` to Access Hosts

3. **Set All Variables in Railway:**
   - Copy template from `backend/.env.railway`
   - Replace placeholders with actual values
   - Save in Railway → Variables tab

4. **Check Logs:**
   - Railway → Deployments → View Logs
   - Fix any errors shown

5. **Test Again:**
   ```powershell
   curl https://houssame-production.up.railway.app/health
   ```

---

## 📋 Environment Variables Quick Reference

| Variable | Where to Get It |
|----------|----------------|
| DB_HOST | Hostinger → Remote MySQL (srv####.hstgr.io) |
| DB_USER | Already set: u894306996_harbi |
| DB_PASSWORD | Hostinger → MySQL Databases → Reset Password |
| DB_NAME | Already set: u894306996_harbi |
| CORS_ORIGIN | Your domain: https://harbi.benmina.com |
| JWT_SECRET | Generate random string (see command above) |

---

## 🆘 Still Not Working?

### Test Database Connection Locally

```powershell
cd backend

# Create .env file
notepad .env

# Add (with your actual password):
DB_HOST=srv1268.hstgr.io
DB_PORT=3306
DB_USER=u894306996_harbi
DB_PASSWORD=YOUR_ACTUAL_PASSWORD
DB_NAME=u894306996_harbi

# Test connection
npm install
node test-hostinger-db.js
```

If this works locally, the issue is Railway variables.
If this fails, the issue is Hostinger MySQL setup.

---

## ✅ Success Indicators

When everything works, you'll see:

1. **Railway Logs:**
   ```
   ✅ Connected to MySQL database
   🚀 Server running on port 5000
   🌐 CORS enabled for: https://harbi.benmina.com
   ```

2. **Health Check:**
   ```json
   {
     "status": "OK",
     "database": "Connected"
   }
   ```

3. **Frontend works** - Can register/login users!

---

**Next:** Check Railway Variables → Fix any missing/wrong values → Wait for redeploy → Test health endpoint
