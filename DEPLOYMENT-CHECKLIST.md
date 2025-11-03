# 🚀 Deployment Checklist for Parapharmacie Store

## ✅ Pre-Deployment

### Code Preparation
- [ ] All code committed to GitHub
- [ ] `.env` files are in `.gitignore`
- [ ] No sensitive data in code
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend builds successfully (`cd backend && npm run build`)

### Testing
- [ ] App works locally
- [ ] All features tested
- [ ] No console errors
- [ ] Mobile responsive checked

---

## 🔧 Backend Deployment (Railway)

### 1. Create Railway Account
- [ ] Sign up at https://railway.app
- [ ] Connect GitHub account

### 2. Deploy Backend
- [ ] Create new project in Railway
- [ ] Connect GitHub repository
- [ ] Railway detects Node.js project
- [ ] Set root directory to `backend` (if needed)

### 3. Add PostgreSQL
- [ ] Click "New" → "Database" → "PostgreSQL"
- [ ] Wait for provisioning (creates `DATABASE_URL` automatically)

### 4. Set Environment Variables
Go to Backend Service → Variables → Add:
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `JWT_SECRET` = `[Generate secure random string]`
- [ ] `FRONTEND_URL` = `[Will set after frontend deployment]`
- [ ] `JWT_EXPIRES_IN` = `7d`
- [ ] `DATABASE_URL` = (Auto-set by Railway PostgreSQL)

**Generate JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Run Database Migrations
**Option A: Railway CLI**
```powershell
railway login
railway link
railway run psql $DATABASE_URL < db/schema.postgres.sql
railway run psql $DATABASE_URL < db/seed.postgres.sql
```

**Option B: Railway Dashboard**
- [ ] Go to PostgreSQL service → Data
- [ ] Copy `DATABASE_URL`
- [ ] Run locally:
```powershell
psql [DATABASE_URL] < db/schema.postgres.sql
psql [DATABASE_URL] < db/seed.postgres.sql
```

### 6. Verify Backend Deployment
- [ ] Copy Railway backend URL (e.g., `https://your-app.railway.app`)
- [ ] Test health check: `https://your-app.railway.app/health`
- [ ] Should return: `{"status":"ok","timestamp":"..."}`

---

## 🌐 Frontend Deployment (Vercel)

### 1. Create Vercel Account
- [ ] Sign up at https://vercel.com
- [ ] Connect GitHub account

### 2. Import Project
- [ ] Click "Add New Project"
- [ ] Select your repository
- [ ] Framework Preset: **Vite**
- [ ] Root Directory: `./` (root)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### 3. Set Environment Variables
- [ ] Go to Project Settings → Environment Variables
- [ ] Add: `VITE_API_URL` = `https://your-backend.railway.app/api`
- [ ] Apply to: Production, Preview, Development

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Copy deployment URL (e.g., `https://your-app.vercel.app`)

### 5. Update Backend CORS
- [ ] Go back to Railway → Backend service → Variables
- [ ] Update `FRONTEND_URL` = `https://your-app.vercel.app`
- [ ] Redeploy backend (automatic)

---

## 🌐 Alternative: Frontend Deployment (Netlify)

### 1. Create Netlify Account
- [ ] Sign up at https://netlify.com
- [ ] Connect GitHub account

### 2. Import Project
- [ ] Click "Add new site"
- [ ] Select repository
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`

### 3. Set Environment Variables
- [ ] Go to Site settings → Environment variables
- [ ] Add: `VITE_API_URL` = `https://your-backend.railway.app/api`

### 4. Deploy
- [ ] Deploy site
- [ ] Update Railway `FRONTEND_URL` with Netlify URL

---

## 🧪 Post-Deployment Testing

### Backend Tests
- [ ] Health check works: `/health`
- [ ] Login API works: `POST /api/auth/login`
- [ ] Products API works: `GET /api/products`
- [ ] CORS headers present
- [ ] SSL certificate active (HTTPS)

### Frontend Tests
- [ ] Site loads successfully
- [ ] Homepage displays products
- [ ] Can register new account
- [ ] Can login with test accounts
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can create order
- [ ] Admin panel accessible
- [ ] Delivery dashboard works
- [ ] No CORS errors in console
- [ ] No 404 errors on refresh

### Full Integration Tests
- [ ] Create new user account
- [ ] Login as user
- [ ] Add products to cart
- [ ] Create order
- [ ] Login as admin (`admin@example.com`)
- [ ] View all orders
- [ ] Assign delivery person
- [ ] Login as delivery (`delivery@example.com`)
- [ ] Mark order as delivered
- [ ] Update payment status

---

## 🔒 Security Checklist

### Backend Security
- [ ] JWT_SECRET is strong (64+ characters)
- [ ] Passwords hashed with bcrypt
- [ ] HTTPS enabled (Railway automatic)
- [ ] CORS configured with specific origin
- [ ] Rate limiting active
- [ ] Helmet.js security headers
- [ ] No sensitive data in logs
- [ ] Database SSL enabled (Railway automatic)

### Frontend Security
- [ ] No API keys in code
- [ ] Environment variables used correctly
- [ ] HTTPS enabled (Vercel/Netlify automatic)
- [ ] No sensitive data in localStorage
- [ ] JWT stored securely

---

## 📊 Monitoring Setup

### Railway
- [ ] Check deployment logs for errors
- [ ] Monitor resource usage
- [ ] Set up alerts for downtime
- [ ] Enable automatic backups

### Vercel/Netlify
- [ ] Check deployment logs
- [ ] Monitor bandwidth usage
- [ ] Set up performance monitoring

---

## 🔄 Continuous Deployment

Once set up, updates are automatic:

### To Deploy Updates
```powershell
# Make changes
git add .
git commit -m "Your update message"
git push origin main

# Railway and Vercel/Netlify auto-deploy
# Wait 2-5 minutes for deployment
```

---

## 🆘 Troubleshooting

### CORS Errors
- [ ] Check `FRONTEND_URL` in Railway matches Vercel URL exactly
- [ ] Ensure no trailing slash in URLs
- [ ] Check Railway logs for CORS errors
- [ ] Redeploy backend after updating CORS

### Database Errors
- [ ] Verify `DATABASE_URL` is set
- [ ] Check migrations ran successfully
- [ ] Look at Railway PostgreSQL logs
- [ ] Test connection with Railway CLI

### Build Failures

**Backend:**
- [ ] Check Railway build logs
- [ ] Ensure `package.json` has all dependencies
- [ ] Test build locally: `npm run build`
- [ ] Check TypeScript errors

**Frontend:**
- [ ] Check Vercel/Netlify build logs
- [ ] Verify `VITE_API_URL` is set
- [ ] Test build locally: `npm run build`
- [ ] Check for import errors

### API Not Working
- [ ] Verify backend is deployed and running
- [ ] Check backend health endpoint
- [ ] Verify API URL in frontend environment
- [ ] Check network tab in browser DevTools
- [ ] Look for authentication errors

---

## 📞 Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Community**: https://discord.gg/railway
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## 🎉 Success!

When everything is checked off:
- ✅ Backend live on Railway
- ✅ Database provisioned and seeded
- ✅ Frontend live on Vercel/Netlify
- ✅ All tests passing
- ✅ Security measures in place
- ✅ Continuous deployment active

**Your Parapharmacie Store is now live! 🚀**

Share your live URL: `https://your-app.vercel.app`

---

## 📈 Next Steps (Optional)

- [ ] Add custom domain
- [ ] Set up email notifications
- [ ] Add payment gateway integration
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure CDN for images
- [ ] Add Google Analytics
- [ ] Set up automated testing
- [ ] Create backup strategy
- [ ] Document API with Swagger
- [ ] Add rate limiting per user
