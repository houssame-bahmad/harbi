# 🚂 Railway Deployment Guide - Step by Step

## ✅ Prerequisites Complete
- [x] Git repository initialized
- [x] Backend code committed
- [x] Railway configuration ready

---

## 🚀 Deploy Backend to Railway (15 minutes)

### Step 1: Create Railway Account
1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login with GitHub"**
3. Authorize Railway to access your GitHub

### Step 2: Push to GitHub (Required for Railway)

**Option A: Create New GitHub Repository**
```powershell
# 1. Go to github.com and create a new repository named "parapharmacie-store"
# 2. Copy the repository URL
# 3. Run these commands:

git remote add origin https://github.com/YOUR_USERNAME/parapharmacie-store.git
git branch -M main
git push -u origin main
```

**Option B: Push to Existing Repository**
```powershell
# If you already have the repository created:
git remote add origin https://github.com/houssame-bahmad/harbi.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Railway

1. **Go to Railway Dashboard**
   - Visit https://railway.app/dashboard
   - Click **"New Project"**

2. **Deploy from GitHub**
   - Click **"Deploy from GitHub repo"**
   - Select your repository: **parapharmacie-store** (or **harbi**)
   - Railway will automatically detect it's a Node.js project

3. **Configure Root Directory** (Important!)
   - Click on your service
   - Go to **Settings** tab
   - Scroll to **"Root Directory"**
   - Set to: `backend`
   - Click **"Update"**

### Step 4: Add PostgreSQL Database

1. **In your Railway project:**
   - Click **"New"** button
   - Select **"Database"**
   - Choose **"Add PostgreSQL"**
   - Wait for provisioning (~30 seconds)

2. **Database is auto-configured!**
   - Railway automatically creates `DATABASE_URL` variable
   - Your backend will connect automatically

### Step 5: Set Environment Variables

1. **Click on your backend service**
2. **Go to "Variables" tab**
3. **Add these variables:**

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<PASTE_THE_SECRET_BELOW>
FRONTEND_URL=https://your-frontend.vercel.app
JWT_EXPIRES_IN=7d
```

**Generate JWT_SECRET:**
```powershell
# Run this command to generate a secure secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` value.

**Note:** You'll update `FRONTEND_URL` after deploying the frontend.

### Step 6: Deploy!

1. **Railway will automatically deploy**
   - Watch the build logs
   - Wait 2-3 minutes for build to complete

2. **Get your backend URL:**
   - Click on your backend service
   - Go to **"Settings"** tab
   - Find **"Domains"** section
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `https://your-app.up.railway.app`)

### Step 7: Run Database Migrations

**Option A: Using Railway Dashboard** (Easiest - Recommended)
1. Click on **PostgreSQL** service in Railway
2. Go to **"Connect"** tab
3. Copy the **"Postgres Connection URL"** (DATABASE_URL)
4. Run migrations locally using psql:
```powershell
# Set the DATABASE_URL as environment variable (replace with your actual URL)
$env:DATABASE_URL="postgresql://postgres:password@region.railway.app:5432/railway"

# Run schema migration
psql $env:DATABASE_URL -f db/schema.postgres.sql

# Run seed data
psql $env:DATABASE_URL -f db/seed.postgres.sql
```

**Option B: Using Railway CLI**
```powershell
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project (use web interface to get project ID)
# In Railway dashboard, go to Project Settings to find your project ID
railway link [PROJECT_ID]

# Or link interactively
railway link

# Run migrations
railway run psql $DATABASE_URL -f db/schema.postgres.sql
railway run psql $DATABASE_URL -f db/seed.postgres.sql
```

**Option C: Manual via Railway Web Console**
1. Click on **PostgreSQL** service
2. Go to **"Data"** tab
3. Click **"Query"** button
4. Copy contents from `db/schema.postgres.sql` and paste, then Execute
5. Copy contents from `db/seed.postgres.sql` and paste, then Execute

**Note:** If you don't have `psql` installed locally, use Option C (Railway Web Console)

### Step 8: Verify Deployment

1. **Test health endpoint:**
   ```
   https://your-app.up.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Test login endpoint:**
   ```powershell
   curl -X POST https://your-app.up.railway.app/api/auth/login `
     -H "Content-Type: application/json" `
     -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'
   ```
   Should return a JWT token!

---

## ✅ Success Checklist

- [ ] Railway account created
- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Backend service deployed
- [ ] PostgreSQL database added
- [ ] Environment variables set (including JWT_SECRET)
- [ ] Database migrations run
- [ ] Health endpoint works
- [ ] Login endpoint works
- [ ] Backend URL copied

---

## 🎯 Next Steps

### Your Backend is Live! 🎉

**Backend URL:** `https://your-app.up.railway.app`

**Next:**
1. Deploy frontend to Vercel (see DEPLOYMENT-CHECKLIST.md)
2. Update `VITE_API_URL` in Vercel to your Railway URL
3. Update `FRONTEND_URL` in Railway to your Vercel URL
4. Test the full application!

---

## 🔧 Troubleshooting

### "You must specify a workspaceId to create a project"
This error occurs when using Railway CLI. **Solutions:**

**Solution 1: Use Railway Dashboard (Recommended)**
- Don't use CLI for initial setup
- Use the web interface at https://railway.app
- Deploy directly from GitHub (easier and more reliable)

**Solution 2: Link to Existing Project**
```powershell
# Login first
railway login

# Link to existing project (interactive - select from list)
railway link

# Or specify project ID (found in Railway dashboard URL)
railway link [your-project-id]
```

**Solution 3: Create Workspace First**
1. Go to Railway dashboard
2. Create a new workspace if you don't have one
3. Then use `railway link` to connect to projects in that workspace

### Build Fails
- Check Railway build logs
- Ensure `backend/package.json` has all dependencies
- Verify `backend/tsconfig.json` exists
- Check Railway root directory is set to `backend`

### Database Connection Error
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set automatically
- Look at Railway logs for connection errors

### Migration Fails
- Ensure PostgreSQL is fully provisioned (wait 1-2 minutes)
- Try running migrations again
- Check SQL syntax in schema files

### Cannot Access API
- Verify domain is generated
- Check if service is deployed (green status)
- Look at deployment logs
- Test health endpoint first

---

## 📊 Railway Dashboard Tips

### Monitor Your App:
- **Deployments:** See build history and logs
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Variables:** Manage environment variables
- **Settings:** Configure domain, restarts, etc.

### View Logs:
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. Click **"View Logs"**

---

## 💰 Railway Pricing

**Hobby Plan:** $5/month
- 500 execution hours
- Shared CPU
- 512 MB RAM
- 1 GB disk
- Perfect for this project!

**Free Trial:** $5 credit
- Test before committing
- No credit card required initially

---

## 🎊 Congratulations!

Your backend is now live on Railway! 🚀

**What you have:**
- ✅ Production Express.js server
- ✅ PostgreSQL database
- ✅ Automatic HTTPS
- ✅ Automatic deployments on git push
- ✅ Environment variables secured
- ✅ Real-time logs and monitoring

**Backend API is ready for your frontend!** 🌐
