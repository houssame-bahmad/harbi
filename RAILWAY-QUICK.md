# 🚀 Quick Railway Deployment

## ✅ Code is Ready!
Your backend code is now on GitHub at:
**https://github.com/houssame-bahmad/harbi**

---

## 📋 Next Steps (15 minutes)

### 1. Go to Railway
👉 **https://railway.app**

### 2. Login with GitHub
- Click "Start a New Project"
- Authorize Railway to access GitHub

### 3. Deploy Your Repository
- Click "Deploy from GitHub repo"
- Select: **houssame-bahmad/harbi**
- Railway auto-detects Node.js project

### 4. Configure Root Directory
- Click on your service
- Settings tab → Root Directory
- Set to: **`backend`**
- Click "Update"

### 5. Add PostgreSQL Database
- Click "New" → Database → Add PostgreSQL
- Wait 30 seconds for provisioning
- `DATABASE_URL` is auto-created!

### 6. Set Environment Variables
Variables tab → Add these:

```
NODE_ENV = production
PORT = 5000
JWT_SECRET = [Generate below]
FRONTEND_URL = https://your-frontend.vercel.app
JWT_EXPIRES_IN = 7d
```

**Generate JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 7. Get Your Backend URL
- Settings → Domains → "Generate Domain"
- Copy URL: `https://xxxxx.up.railway.app`

### 8. Run Database Migrations

**Option A: Railway CLI**
```powershell
npm install -g @railway/cli
railway login
railway link
railway run psql $DATABASE_URL < db/schema.postgres.sql
railway run psql $DATABASE_URL < db/seed.postgres.sql
```

**Option B: Manual (PostgreSQL Dashboard)**
- Click PostgreSQL service → Data tab
- Copy DATABASE_URL
- Run locally:
```powershell
psql "[YOUR_DATABASE_URL]" < db/schema.postgres.sql
psql "[YOUR_DATABASE_URL]" < db/seed.postgres.sql
```

### 9. Test Your API
```
https://your-app.up.railway.app/health
```
Should return: `{"status":"ok"}`

---

## ✅ Success!
Your backend is live! 🎉

**Next:** Deploy frontend to Vercel
See: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

---

## 🆘 Need Help?
- Full guide: [RAILWAY-DEPLOY.md](./RAILWAY-DEPLOY.md)
- Deployment checklist: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
