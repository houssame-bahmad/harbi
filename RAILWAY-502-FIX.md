# 🚨 URGENT: Railway Backend Not Responding (502 Error)

## Current Status
- ❌ Backend returning 502 Bad Gateway
- ✅ Code compiles successfully
- ⚠️ Railway application is not starting

## Most Likely Cause: Missing Environment Variables

Railway needs these environment variables to start your backend:

### 🔴 CRITICAL - Required Variables

Go to Railway Dashboard and set these **NOW**:

1. **Database Configuration** (Get from Railway MySQL service)
   ```
   DB_HOST=<your-railway-mysql-host>
   DB_USER=<your-railway-mysql-user>
   DB_PASSWORD=<your-railway-mysql-password>
   DB_NAME=<your-database-name>
   ```

2. **Security**
   ```
   JWT_SECRET=your-long-random-secret-key
   ```

3. **CORS**
   ```
   CORS_ORIGIN=https://harbi.benmina.com
   NODE_ENV=production
   ```

---

## 📋 Step-by-Step Fix

### Step 1: Get Database Credentials from Railway

1. Go to https://railway.app
2. Open your project
3. Click on **MySQL** service (not backend)
4. Go to **Variables** tab
5. Copy these values:
   - `MYSQLHOST` → You'll use for `DB_HOST`
   - `MYSQLUSER` → You'll use for `DB_USER`
   - `MYSQLPASSWORD` → You'll use for `DB_PASSWORD`
   - `MYSQLDATABASE` → You'll use for `DB_NAME`

### Step 2: Set Variables in Backend Service

1. In Railway, click on your **Backend** service
2. Go to **Variables** tab
3. Click **+ New Variable**
4. Add each variable:

   **Database Variables:**
   - Name: `DB_HOST`, Value: (paste from MySQL MYSQLHOST)
   - Name: `DB_USER`, Value: (paste from MySQL MYSQLUSER)
   - Name: `DB_PASSWORD`, Value: (paste from MySQL MYSQLPASSWORD)
   - Name: `DB_NAME`, Value: (paste from MySQL MYSQLDATABASE)

   **Security Variables:**
   - Name: `JWT_SECRET`, Value: `super-secret-jwt-key-please-change-this-to-something-random`
   
   **CORS Variables:**
   - Name: `CORS_ORIGIN`, Value: `https://harbi.benmina.com`
   - Name: `NODE_ENV`, Value: `production`

### Step 3: Redeploy

After adding all variables:
1. Railway will auto-redeploy, OR
2. Click **Deploy** → **Redeploy**

### Step 4: Wait & Verify (2-3 minutes)

Watch the deployment logs:
1. Click **Deployments** tab
2. Click on the latest deployment
3. Watch the logs
4. Look for: `🚀 SERVER STARTED SUCCESSFULLY!`

---

## 🔍 How to Check Logs in Railway

1. Railway Dashboard → Your Backend Service
2. Click **Deployments** tab
3. Click on latest deployment
4. Look for errors in the logs

**What to look for:**
- ❌ `Error: connect ECONNREFUSED` → Database not reachable
- ❌ `Error: Access denied` → Wrong database password
- ❌ `Cannot find module` → Build issue
- ✅ `🚀 SERVER STARTED SUCCESSFULLY!` → Working!

---

## ⚡ Quick Alternative: Test with Mock Data

If you want to get the frontend working FIRST while fixing database:

### Option A: Use Mock API Temporarily

1. Open `src/App.tsx` or your main component
2. Change API import from `api.ts` to `mockApi.ts`
3. This will use mock data (no backend needed)
4. Your frontend will work immediately
5. Fix Railway backend later

### Option B: Simplify Backend Startup

Create a minimal backend that doesn't need database:

1. In `backend/src/server.ts`, comment out database connection
2. Make routes return mock data temporarily
3. This proves CORS is working
4. Then add database back

---

## 🎯 Most Common Railway Issues

### Issue 1: No Environment Variables Set
**Symptom:** 502 Bad Gateway  
**Fix:** Set all environment variables (see Step 2 above)

### Issue 2: Wrong Database Host
**Symptom:** `Error: connect ECONNREFUSED`  
**Fix:** Use Railway's internal DATABASE_URL or copy exact host from MySQL service

### Issue 3: Database Not Running
**Symptom:** `Error: getaddrinfo ENOTFOUND`  
**Fix:** Start/restart MySQL service in Railway

### Issue 4: Build Fails
**Symptom:** Deployment fails at build step  
**Fix:** Check build logs, ensure `npm install` and `npm run build` work

---

## 🔧 Railway CLI Alternative (Advanced)

If you prefer command line:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Set variables
railway variables set DB_HOST=<host>
railway variables set DB_USER=<user>
railway variables set DB_PASSWORD=<password>
railway variables set DB_NAME=<database>
railway variables set JWT_SECRET=your-secret
railway variables set CORS_ORIGIN=https://harbi.benmina.com
railway variables set NODE_ENV=production

# Check status
railway status

# View logs
railway logs
```

---

## ✅ Success Checklist

After setting variables and redeploying:

- [ ] Deployment shows "Success" in Railway
- [ ] Logs show "SERVER STARTED SUCCESSFULLY"
- [ ] `curl https://harbi-production.up.railway.app/health` returns 200 OK
- [ ] Test page shows ✅ SUCCESS
- [ ] Frontend loads products without CORS errors

---

## 🆘 Still Not Working?

### Check These:

1. **MySQL Service Status**
   - Railway Dashboard → MySQL Service
   - Make sure it's running (green checkmark)
   - If stopped, click **Deploy**

2. **Port Configuration**
   - Railway should auto-assign PORT
   - Don't set PORT environment variable manually
   - Backend reads from `process.env.PORT || 5000`

3. **Recent Deployments**
   - Check if deployment actually completed
   - Look for error messages in logs
   - Try manual redeploy

### Get Help:

**Copy this info when asking for help:**
```
Project: harbi
Backend URL: https://harbi-production.up.railway.app
Frontend URL: https://harbi.benmina.com
Error: 502 Bad Gateway
Status: Application failed to respond
```

Then check:
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app

---

## 🎯 Next Steps RIGHT NOW

1. ✅ Go to Railway Dashboard
2. ✅ Open your Backend service
3. ✅ Click Variables tab
4. ✅ Set all 7 variables listed above
5. ✅ Wait for auto-redeploy (or trigger manually)
6. ✅ Wait 2-3 minutes
7. ✅ Test the health endpoint again
8. ✅ Refresh your test page and click buttons

**The CORS fix is already deployed in the code - you just need the backend to start!**

---

Last updated: November 3, 2025  
Status: CORS fixed ✅ | Backend down ❌ | Waiting for env vars ⏳
