# Parapharmacie Store - Deployment Guide

## 📦 Project Structure

```
parapharmacie-store/
├── backend/              # Node.js/Express API (Deploy to Railway)
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── server.ts    # Express server
│   ├── package.json
│   └── tsconfig.json
│
├── services/            # Frontend API client
│   └── api.ts          # HTTP client for backend
│
└── (frontend files)    # React app (Deploy to Vercel/Netlify)
```

## 🚀 Backend Deployment (Railway)

### 1. Prerequisites
- GitHub account
- Railway account (https://railway.app)
- PostgreSQL database

### 2. Setup Railway Project

**Option A: Deploy from GitHub**
1. Push your code to GitHub
2. Go to Railway.app and click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect the backend folder

**Option B: Railway CLI**
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Navigate to backend folder
cd backend

# Initialize and deploy
railway init
railway up
```

### 3. Add PostgreSQL Database
1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway automatically creates `DATABASE_URL` environment variable
3. Your backend will connect automatically

### 4. Run Database Migrations
```powershell
# In Railway dashboard, go to your backend service
# Click "Settings" → "Deploy"
# Add a custom build command:
# Build Command: npm run build && node dist/scripts/migrate.js
```

Or manually run migrations:
```powershell
railway run psql -d $DATABASE_URL -f db/schema.postgres.sql
railway run psql -d $DATABASE_URL -f db/seed.postgres.sql
```

### 5. Set Environment Variables
In Railway dashboard → Your backend service → Variables:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-generate-a-new-one
FRONTEND_URL=https://your-frontend-app.vercel.app
JWT_EXPIRES_IN=7d
DATABASE_URL=(automatically set by Railway)
```

**Generate a secure JWT secret:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. Deploy
- Railway automatically deploys on git push
- Get your backend URL: `https://your-app.railway.app`

---

## 🌐 Frontend Deployment (Vercel)

### 1. Setup Vercel

**Option A: Vercel Dashboard**
1. Go to vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root of project)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

**Option B: Vercel CLI**
```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 2. Set Environment Variables
In Vercel dashboard → Your project → Settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.railway.app/api
```

### 3. Redeploy
- Vercel automatically redeploys on git push
- Or manually: `vercel --prod`

---

## 🌐 Frontend Deployment (Netlify)

### 1. Setup Netlify
1. Go to netlify.com and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 2. Set Environment Variables
In Netlify dashboard → Site settings → Environment variables:

```env
VITE_API_URL=https://your-backend.railway.app/api
```

### 3. Deploy
- Netlify automatically deploys on git push

---

## 🔒 Security Checklist

### Backend (Railway)
- [x] Use strong JWT_SECRET (64+ random characters)
- [x] Enable HTTPS (Railway provides this automatically)
- [x] Set NODE_ENV=production
- [x] Configure CORS with specific frontend URL
- [x] Use bcrypt for password hashing (already implemented)
- [x] Enable rate limiting (already implemented)
- [x] Use Helmet.js for security headers (already implemented)

### Frontend (Vercel/Netlify)
- [x] Set VITE_API_URL to production backend
- [x] Enable HTTPS (provided automatically)
- [x] Never commit .env files
- [x] Use environment variables for sensitive data

### Database (Railway PostgreSQL)
- [x] Enable SSL connections (Railway default)
- [x] Use strong passwords
- [x] Regular backups (Railway provides automatic backups)

---

## 📋 Deployment Steps Summary

### First Time Deployment

**1. Backend (Railway)**
```powershell
cd backend
git init
git add .
git commit -m "Initial backend"
git push origin main

# Then on Railway:
# - Create new project from GitHub
# - Add PostgreSQL database
# - Set environment variables
# - Deploy automatically
```

**2. Database Setup**
```powershell
# Copy your Railway DATABASE_URL
# Run migrations locally or via Railway CLI
railway run psql -d $DATABASE_URL -f ../db/schema.postgres.sql
railway run psql -d $DATABASE_URL -f ../db/seed.postgres.sql
```

**3. Frontend (Vercel/Netlify)**
```powershell
# Set VITE_API_URL to your Railway backend URL
# Deploy via dashboard or CLI
vercel --prod
# or
netlify deploy --prod
```

---

## 🧪 Testing Deployment

### 1. Test Backend API
```powershell
# Health check
curl https://your-backend.railway.app/health

# Test login
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 2. Test Frontend
- Open `https://your-frontend.vercel.app`
- Try logging in
- Check browser console for any CORS errors
- Test creating an order
- Verify admin panel works

---

## 🔧 Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in Railway matches your exact Vercel URL
- Check Railway backend logs for CORS errors

### Database Connection Issues
- Verify `DATABASE_URL` is set in Railway
- Check if database migrations ran successfully
- Look at Railway logs for connection errors

### Build Failures
**Backend:**
- Check Railway build logs
- Ensure all dependencies are in package.json
- Verify TypeScript compiles: `npm run build`

**Frontend:**
- Check Vercel/Netlify build logs
- Ensure `VITE_API_URL` is set correctly
- Test build locally: `npm run build`

### Environment Variables Not Working
- Restart the service after adding variables
- For Vite variables, they must start with `VITE_`
- Redeploy after changing variables

---

## 📊 Monitoring

### Railway (Backend)
- View logs in Railway dashboard
- Monitor CPU/memory usage
- Set up error alerts

### Vercel/Netlify (Frontend)
- View deployment logs
- Monitor build times
- Check analytics for traffic

---

## 🔄 Continuous Deployment

Once set up, automatic deployment works like this:

1. Make changes locally
2. Commit and push to GitHub:
   ```powershell
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Railway automatically deploys backend
4. Vercel/Netlify automatically deploys frontend
5. Changes are live in ~2-5 minutes

---

## 💰 Cost Estimates

### Railway (Backend + Database)
- **Free Tier**: $5/month credit (500 hours)
- **Hobby Plan**: $5/month (ideal for small apps)
- **Pro Plan**: $20/month (production apps)

### Vercel (Frontend)
- **Hobby**: Free (perfect for personal projects)
- **Pro**: $20/month (commercial projects)

### Netlify (Frontend)
- **Starter**: Free (100GB bandwidth)
- **Pro**: $19/month (unlimited bandwidth)

---

## 📞 Support

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] PostgreSQL database created
- [ ] Database migrations run successfully
- [ ] Environment variables set (JWT_SECRET, FRONTEND_URL)
- [ ] Frontend deployed to Vercel/Netlify
- [ ] VITE_API_URL points to Railway backend
- [ ] Test login with test accounts
- [ ] Test product browsing
- [ ] Test order creation
- [ ] Test admin panel
- [ ] Test delivery dashboard
- [ ] Check all API endpoints work
- [ ] Verify CORS is configured correctly
- [ ] Check SSL certificates (HTTPS)
- [ ] Monitor logs for errors
- [ ] Set up custom domain (optional)

---

**Your app is now live! 🎉**
