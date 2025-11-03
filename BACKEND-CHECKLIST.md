# ✅ Backend Deployment Checklist

## Before You Start
- [x] Code on GitHub: https://github.com/houssame-bahmad/harbi
- [x] Backend code in `/backend/` folder
- [x] Railway configuration ready

---

## 🚀 Deployment Steps

### 1. Railway Setup
- [ ] Go to https://railway.app
- [ ] Login with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose: **houssame-bahmad/harbi**

### 2. Configure Service
- [ ] Click on the created service
- [ ] Go to Settings tab
- [ ] Set Root Directory to: **`backend`**
- [ ] Save changes

### 3. Add Database
- [ ] Click "New" in project
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for provisioning (~30 seconds)

### 4. Environment Variables
Go to service → Variables tab → Add:

```
- [ ] NODE_ENV = production
- [ ] PORT = 5000
- [ ] JWT_SECRET = [generate below]
- [ ] FRONTEND_URL = http://localhost:3001
- [ ] JWT_EXPIRES_IN = 7d
```

**Generate JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Get Backend URL
- [ ] Go to Settings tab
- [ ] Scroll to "Domains"
- [ ] Click "Generate Domain"
- [ ] Copy URL: `https://_______.up.railway.app`
- [ ] Save this URL (you'll need it for frontend)

### 6. Run Database Migrations
- [ ] Click PostgreSQL service → Data tab → Query
- [ ] Copy/paste `db/schema.postgres.sql` content
- [ ] Execute
- [ ] Copy/paste `db/seed.postgres.sql` content  
- [ ] Execute

### 7. Test Backend
- [ ] Visit: `https://your-backend.up.railway.app/health`
- [ ] Should see: `{"status":"ok"}`
- [ ] Test login: See BACKEND-DEPLOY.md

---

## ✅ Success Criteria

Backend is ready when:
- [x] Railway service deployed (green status)
- [x] PostgreSQL database running
- [x] All environment variables set
- [x] Domain generated
- [x] Migrations completed
- [x] Health endpoint returns OK
- [x] Backend URL saved for frontend

---

## 🎯 What's Next?

**You now have:**
✅ Backend API running on Railway
✅ PostgreSQL database with data
✅ Backend URL ready

**Next step:**
→ Deploy frontend to Hostinger
→ See [HOSTINGER-DEPLOY.md](./HOSTINGER-DEPLOY.md)
→ Use your Railway URL as API endpoint

---

**Backend URL to use in frontend:**
```
https://your-backend.up.railway.app/api
```

Save this! You'll need it when building your frontend. 🎉
