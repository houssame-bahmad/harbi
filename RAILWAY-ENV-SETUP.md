# Railway Environment Variables - Quick Setup Guide

## 🚂 Required Environment Variables

Copy these to your Railway project dashboard:

### Database Configuration
```
DB_HOST=<your-mysql-host>
DB_USER=<your-mysql-user>
DB_PASSWORD=<your-mysql-password>
DB_NAME=<your-database-name>
DB_PORT=3306
```

### Security
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### CORS Configuration
```
CORS_ORIGIN=https://harbi.benmina.com
NODE_ENV=production
```

### Rate Limiting (Optional)
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🔧 How to Set Environment Variables in Railway

### Method 1: Railway Dashboard (Recommended)
1. Go to https://railway.app
2. Open your project: `harbi-production`
3. Click on your backend service
4. Go to **Variables** tab
5. Click **+ New Variable**
6. Add each variable one by one:
   - Variable name: `DB_HOST`
   - Value: `your-mysql-host`
   - Click **Add**
7. Repeat for all variables above

### Method 2: Railway CLI
```bash
# Install Railway CLI if not already installed
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set variables
railway variables set DB_HOST=<your-mysql-host>
railway variables set DB_USER=<your-mysql-user>
railway variables set DB_PASSWORD=<your-mysql-password>
railway variables set DB_NAME=<your-database-name>
railway variables set JWT_SECRET=<your-secret>
railway variables set CORS_ORIGIN=https://harbi.benmina.com
railway variables set NODE_ENV=production
```

---

## 🔍 Important Notes

### CORS_ORIGIN
- **MUST** match your frontend domain exactly
- Include protocol (`https://`)
- No trailing slash
- Examples:
  - ✅ `https://harbi.benmina.com`
  - ❌ `harbi.benmina.com` (missing https://)
  - ❌ `https://harbi.benmina.com/` (trailing slash)

### Database Credentials
- Get these from your Railway MySQL service
- In Railway Dashboard:
  1. Click on MySQL service
  2. Go to **Variables** tab
  3. Look for:
     - `MYSQLHOST` → use for `DB_HOST`
     - `MYSQLUSER` → use for `DB_USER`
     - `MYSQLPASSWORD` → use for `DB_PASSWORD`
     - `MYSQLDATABASE` → use for `DB_NAME`

### JWT_SECRET
- Should be a long random string
- Generate one: `openssl rand -base64 64`
- Or use: https://randomkeygen.com/
- **DO NOT** commit this to git
- Keep it secret and secure

---

## ✅ Verification

After setting environment variables:

1. **Trigger Redeploy**
   - Push a commit to GitHub, OR
   - In Railway dashboard, click **Deploy** → **Redeploy**

2. **Check Logs**
   - In Railway dashboard, go to **Deployments**
   - Click on latest deployment
   - Look for startup logs:
     ```
     🔧 SERVER CONFIGURATION:
        PORT: 5000
        NODE_ENV: production
        CORS_ORIGIN: https://harbi.benmina.com
        DB_HOST: <your-host>
        DB_NAME: <your-database>
        JWT_SECRET: ***<last-4-chars>
     
     🚀 SERVER STARTED SUCCESSFULLY!
     ```

3. **Test Connection**
   - Visit: https://harbi-production.up.railway.app/health
   - Should return:
     ```json
     {
       "status": "ok",
       "timestamp": "2025-11-03T...",
       "env": "production",
       "cors": "https://harbi.benmina.com"
     }
     ```

---

## 🚨 Troubleshooting

### "Application failed to respond" (502 Error)
Possible causes:
1. **Database connection failed**
   - Verify DB credentials are correct
   - Check MySQL service is running
   - Check DB_HOST includes port if needed

2. **Missing JWT_SECRET**
   - Add `JWT_SECRET` environment variable
   - Redeploy

3. **Build failed**
   - Check Railway build logs
   - Make sure `npm install` succeeds
   - Make sure TypeScript compiles without errors

### How to Check:
1. Railway Dashboard → Your Service → **Deployments**
2. Click on latest deployment
3. Check **Build Logs** and **Deploy Logs**
4. Look for error messages

---

## 🔄 After Changing Variables

**IMPORTANT:** Railway requires a redeploy after changing environment variables.

Options:
1. **Automatic:** Push a commit to GitHub
2. **Manual:** Railway Dashboard → **Deploy** → **Redeploy**

Wait 1-3 minutes for deployment to complete.

---

## 📋 Current Setup Checklist

- [ ] MySQL service is running in Railway
- [ ] Database credentials are set in environment variables
- [ ] JWT_SECRET is set
- [ ] CORS_ORIGIN is set to `https://harbi.benmina.com`
- [ ] NODE_ENV is set to `production`
- [ ] Latest code is pushed to GitHub
- [ ] Railway deployment is successful
- [ ] Health endpoint returns 200 OK
- [ ] No CORS errors in browser console

---

## 🔗 Helpful Links

- Railway Dashboard: https://railway.app
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your Backend: https://harbi-production.up.railway.app
- Your Frontend: https://harbi.benmina.com

---

**Need Help?**
Check Railway logs first, they usually show exactly what's wrong!
