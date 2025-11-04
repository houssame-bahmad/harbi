# 🚀 RAILWAY DEPLOYMENT - QUICK STEPS

## ⚡ Deploy in 10 Minutes

### 1️⃣ Get MySQL Info from Hostinger (2 min)

**Login to Hostinger cPanel:**

```
1. Go to cPanel → MySQL Databases
2. Find your database: u894306996_harbi
3. Note the password (or reset it)
4. Go to Remote MySQL
5. Add Access Host: % (or specific IP)
6. Find your host: Usually srv####.hstgr.io
```

**What you need:**
- ✅ Host: `srv1268.hstgr.io` (or similar)
- ✅ User: `u894306996_harbi`
- ✅ Password: `[from cPanel]`
- ✅ Database: `u894306996_harbi`

---

### 2️⃣ Upload Database Schema (2 min)

**In Hostinger cPanel → phpMyAdmin:**

```
1. Click on database: u894306996_harbi
2. Go to "Import" tab
3. Choose file: backend/db/schema.mysql.sql
4. Click "Go"
5. (Optional) Import backend/db/seed.mysql.sql for test data
```

---

### 3️⃣ Deploy to Railway (3 min)

**Go to [railway.app](https://railway.app):**

```
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: houssame-bahmad/harbi
4. Click "Deploy Now"
```

---

### 4️⃣ Set Environment Variables (2 min)

**In Railway → Your Project → Variables tab, add these:**

```env
NODE_ENV=production
PORT=5000
DB_HOST=srv1268.hstgr.io
DB_PORT=3306
DB_USER=u894306996_harbi
DB_PASSWORD=[YOUR_PASSWORD_FROM_HOSTINGER]
DB_NAME=u894306996_harbi
CORS_ORIGIN=https://harbi.benmina.com
JWT_SECRET=[GENERATE_RANDOM_STRING]
```

**Generate JWT_SECRET in PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

### 5️⃣ Get Your Backend URL (1 min)

**In Railway → Settings tab:**

```
1. Click "Generate Domain"
2. Copy the URL: https://[your-app].up.railway.app
3. Save it for frontend config
```

---

### 6️⃣ Test Backend (1 min)

**Open in browser:**
```
https://[your-app].up.railway.app/health
```

**Should return:**
```json
{
  "status": "OK",
  "database": "Connected",
  "timestamp": "..."
}
```

---

### 7️⃣ Update Frontend (1 min)

**In your frontend code (`services/api.ts`):**

```typescript
const API_URL = 'https://[your-app].up.railway.app';
```

**Then rebuild and upload to Hostinger:**
```powershell
npm run build
# Upload dist folder to public_html/harbi/
```

---

## ✅ Quick Test Commands

```powershell
# Test MySQL connection from local
cd backend
npm install
node test-hostinger-db.js

# Test backend API
curl https://[your-app].up.railway.app/health
curl https://[your-app].up.railway.app/api/products
```

---

## 🔥 Common Issues

### ❌ Database connection fails
```
→ Check DB_HOST in Railway variables
→ Verify password is correct
→ Enable Remote MySQL in Hostinger
→ Add "%" to Access Hosts
```

### ❌ CORS errors
```
→ Set CORS_ORIGIN=https://harbi.benmina.com in Railway
→ No trailing slashes in URLs
```

### ❌ 502 Bad Gateway
```
→ Check Railway logs for errors
→ Verify all env variables are set
→ Check deployment status
```

---

## 📋 Checklist

- [ ] Got MySQL password from Hostinger
- [ ] Enabled Remote MySQL (% access)
- [ ] Uploaded schema.mysql.sql via phpMyAdmin
- [ ] Created Railway project
- [ ] Set all 9 environment variables
- [ ] Generated Railway domain
- [ ] Tested /health endpoint
- [ ] Updated frontend API_URL
- [ ] Frontend works with backend

---

## 🎯 URLs Summary

| Service | URL |
|---------|-----|
| Frontend Main | https://benmina.com |
| Frontend Sub | https://harbi.benmina.com |
| Backend API | https://[your-app].up.railway.app |
| Database | Hostinger MySQL (u894306996_harbi) |

---

## 💡 Next Steps After Deployment

1. Test user registration: https://harbi.benmina.com
2. Test login with created user
3. Test product browsing
4. Test cart and checkout
5. Monitor Railway logs for issues

---

## 🆘 Need Help?

Check the full guide: `RAILWAY-HOSTINGER-SETUP.md`
