# 🚂 Deploy Backend to Railway - Simple Guide

## ✅ Your Code is Already on GitHub!
Repository: **https://github.com/houssame-bahmad/harbi**

---

## 🚀 Deploy Backend in 5 Steps

### Step 1: Go to Railway
👉 **https://railway.app**

### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: **houssame-bahmad/harbi**

### Step 3: Configure Backend Service
Railway will create a service automatically. Now configure it:

1. Click on the service (should show as Node.js)
2. Go to **Settings** tab
3. Find **"Root Directory"**
4. Enter: **`backend`**
5. Click **"Update"** or **"Save"**

This tells Railway to only deploy the backend folder.

### Step 4: Add PostgreSQL Database
1. In your Railway project, click **"New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait 30 seconds for it to provision

Railway automatically sets `DATABASE_URL` for you!

### Step 5: Set Environment Variables
1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Add these one by one:

```
NODE_ENV = production
PORT = 5000
JWT_SECRET = [paste secret from below]
FRONTEND_URL = http://localhost:3001
JWT_EXPIRES_IN = 7d
```

**Generate JWT_SECRET:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and use it as JWT_SECRET value.

**Note:** You'll update `FRONTEND_URL` later when you deploy your frontend to Hostinger.

---

## 🎉 Deployment Starts Automatically!

Railway will now:
1. Detect your backend code
2. Install dependencies (`npm install`)
3. Build TypeScript (`npm run build`)
4. Start server (`npm start`)

**Watch the build:** Click on "Deployments" tab to see logs.

---

## 📋 Get Your Backend URL

After deployment completes (2-3 minutes):

1. Click on your backend service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. Copy the URL: `https://xxxxxx.up.railway.app`

---

## 🗄️ Setup Database (Run Migrations)

### Method 1: Using Railway Web Console (Easiest)
1. Click on **PostgreSQL** service
2. Go to **"Data"** tab
3. Click **"Query"** button
4. Open your local `db/schema.postgres.sql` file
5. Copy ALL the content
6. Paste into Railway query editor
7. Click **"Run"** or **"Execute"**
8. Repeat for `db/seed.postgres.sql`

### Method 2: Using psql Locally
1. Click on PostgreSQL service → **"Connect"** tab
2. Copy the **"Postgres Connection URL"**
3. Run locally:
```powershell
# Set the URL (replace with your actual URL)
$env:DATABASE_URL="postgresql://postgres:password@region.railway.app:5432/railway"

# Run migrations
psql $env:DATABASE_URL -f db/schema.postgres.sql
psql $env:DATABASE_URL -f db/seed.postgres.sql
```

---

## ✅ Test Your Backend

### Test Health Endpoint
```
https://your-backend.up.railway.app/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Test Login API
```powershell
# Test login with admin account
curl -X POST https://your-backend.up.railway.app/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@example.com\",\"password\":\"admin123\"}'
```
Should return a JWT token!

---

## 📝 Important URLs

- **Railway Dashboard**: https://railway.app/dashboard
- **Your GitHub Repo**: https://github.com/houssame-bahmad/harbi
- **Backend API**: `https://xxxxxx.up.railway.app` (get from Railway)

---

## 🔄 Auto-Deploy Setup

Good news! Railway is now watching your GitHub repo.

**When you push changes:**
```powershell
git add .
git commit -m "Update backend"
git push origin main
```

Railway will automatically:
1. Detect the push
2. Rebuild backend
3. Redeploy
4. Done in 2-3 minutes!

---

## ✅ Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repo connected (harbi)
- [ ] Backend service created
- [ ] Root directory set to `backend`
- [ ] PostgreSQL database added
- [ ] Environment variables set (NODE_ENV, PORT, JWT_SECRET, FRONTEND_URL, JWT_EXPIRES_IN)
- [ ] Domain generated
- [ ] Database migrations run (schema + seed)
- [ ] Health endpoint tested
- [ ] Login API tested

---

## 🎯 Next Steps

### After Backend is Deployed:

1. **Copy your backend URL** from Railway
2. **Deploy frontend to Hostinger:**
   - See [HOSTINGER-DEPLOY.md](./HOSTINGER-DEPLOY.md)
   - Use your Railway URL as `VITE_API_URL`
3. **Update FRONTEND_URL** in Railway to your Hostinger domain
4. **Test the full application!**

---

## 🆘 Troubleshooting

### Build Fails
- Check **Deployments** tab for error logs
- Verify `backend/package.json` exists
- Ensure root directory is set to `backend`

### Can't Access API
- Check if service is running (green status)
- Verify domain is generated
- Look at deployment logs

### Database Connection Error
- Ensure PostgreSQL is provisioned (takes ~30 seconds)
- Check `DATABASE_URL` is in variables (auto-set)
- Look at service logs for connection errors

---

## 💰 Cost

**Railway Hobby Plan:** $5/month
- Includes PostgreSQL database
- 500 execution hours
- Perfect for this project!

**Free Trial:** $5 credit to start

---

## 🎊 Success!

Your backend is deployed and running on Railway! 🚀

**What you have:**
- ✅ Express.js API live
- ✅ PostgreSQL database
- ✅ HTTPS enabled
- ✅ Auto-deploy from GitHub
- ✅ Environment variables secured

**Ready for your frontend!** 🌐
