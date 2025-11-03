# 📝 Your Deployment Info - Quick Reference

## ✅ What's Already Done

### Frontend (Hostinger)
- **URL**: https://harbi.benmina.com
- **Status**: ✅ DEPLOYED
- **Location**: Hostinger File Manager → `public_html/harbi/` (or similar)

### Database (Hostinger MySQL) - NOT BEING USED
- **Database Name**: `u894306996_harbi`
- **Username**: `u894306996_harbi`
- **Password**: `9Amer.3lih`
- **Host**: `benmina.com`
- **Port**: `3306`
- **Status**: ⚠️ Created but not connected to backend yet

**NOTE**: We're deploying backend to Railway with its own MySQL database instead. The Hostinger database can be used later if needed, but Railway's managed MySQL is easier for the backend.

---

## 🎯 What You Need To Do Now

### 1. Deploy Backend to Railway
Follow the guide: **`YOUR-DEPLOYMENT-STEPS.md`**

**Quick Summary:**
1. Go to https://railway.app
2. Login with GitHub
3. Create new project from `houssame-bahmad/harbi` repo
4. Set root directory to `backend`
5. Add MySQL database (Railway will manage it)
6. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=` (generate with command below)
   - `FRONTEND_URL=https://harbi.benmina.com`
   - `JWT_EXPIRES_IN=7d`
7. Generate domain (you'll get something like `your-app.up.railway.app`)
8. Run database migrations
9. Test backend health endpoint

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Update Frontend
After Railway backend is deployed:

1. Update `.env` with Railway URL:
```env
VITE_API_URL=https://your-railway-url.up.railway.app/api
```

2. Rebuild:
```bash
npm run build
```

3. Re-upload `dist/` to Hostinger

---

## 🔗 Quick Links

- **Frontend**: https://harbi.benmina.com
- **Backend** (after Railway deploy): https://your-app.up.railway.app
- **Railway Dashboard**: https://railway.app/dashboard
- **Hostinger hPanel**: https://hpanel.hostinger.com
- **GitHub Repo**: https://github.com/houssame-bahmad/harbi

---

## 📚 Deployment Guides

1. **YOUR-DEPLOYMENT-STEPS.md** ← START HERE! Custom guide for your setup
2. **HYBRID-DEPLOY.md** - Complete hybrid deployment guide
3. **RAILWAY-DEPLOY.md** - Detailed Railway backend guide

---

## ⚡ Railway Environment Variables Template

Copy this into Railway Variables tab (one at a time):

```
Variable: NODE_ENV
Value: production

Variable: PORT  
Value: 5000

Variable: JWT_SECRET
Value: [PASTE_GENERATED_SECRET_HERE]

Variable: FRONTEND_URL
Value: https://harbi.benmina.com

Variable: JWT_EXPIRES_IN
Value: 7d
```

**DATABASE_URL** will be auto-set when you add MySQL database!

---

## 🧪 Testing Checklist

After deployment:

### Backend Tests:
- [ ] Visit `https://your-railway-url.up.railway.app/api/health`
- [ ] Should return `{"status":"ok","timestamp":"..."}`
- [ ] Check Railway logs for errors

### Frontend Tests:
- [ ] Visit https://harbi.benmina.com
- [ ] No CORS errors in console (F12)
- [ ] Products load
- [ ] Can register new account
- [ ] Can login
- [ ] Can add to cart
- [ ] Can place order

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| CORS errors | Update `FRONTEND_URL` in Railway to `https://harbi.benmina.com` |
| Frontend shows old content | Rebuild frontend and re-upload to Hostinger |
| Backend won't start | Check Railway logs, verify all env variables set |
| Database errors | Run migrations using Railway CLI or setup endpoint |
| 404 errors | Make sure `.htaccess` exists in Hostinger folder |

---

## 📞 Next Steps

1. Open **YOUR-DEPLOYMENT-STEPS.md**
2. Follow Step 2 (Deploy Backend to Railway)
3. Complete all steps in order
4. Test everything works
5. You're done! 🎉
