# Complete Subdomain Deployment Guide - Hostinger

Deploy both your frontend and backend on Hostinger subdomains with MySQL database.

## 📋 Overview

**Setup Structure:**
- **Frontend**: `store.yourdomain.com` (or `parapharmacie.yourdomain.com`)
- **Backend API**: `api.yourdomain.com`
- **Database**: MySQL on Hostinger

---

## 🗄️ Step 1: Create MySQL Database

### 1.1 Access Database Manager
1. Log in to **Hostinger hPanel**
2. Go to **Websites** → Select your hosting plan
3. Click **Databases** in the sidebar
4. Click **Create Database**

### 1.2 Create Database
1. **Database name**: `parapharmacie_db` (or your preferred name)
2. **Username**: Create a new user (e.g., `pharma_user`)
3. **Password**: Generate a strong password (save it securely!)
4. Click **Create**

### 1.3 Note Database Credentials
Save these details (you'll need them for backend):
```
Database Host: localhost (or the host shown in hPanel)
Database Name: u123456789_parapharmacie (format may vary)
Database User: u123456789_pharma_user
Database Password: [your-password]
Database Port: 3306 (MySQL default)
```

### 1.4 Access phpMyAdmin
1. In hPanel → **Databases** → Click **Manage** next to your database
2. This opens phpMyAdmin where you can run SQL queries to set up tables

---

## 🔧 Step 2: Set Up Backend Subdomain (api.yourdomain.com)

### 2.1 Create Subdomain for API
1. In **hPanel** → **Domains** → **Subdomains**
2. Click **Create Subdomain**
3. Enter subdomain: `api`
4. It will create: `api.yourdomain.com`
5. Note the document root (usually `public_html/api`)

### 2.2 Prepare Backend Files
On your local machine:

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not already done)
npm install

# Build the backend
npm run build
```

This creates a `dist` folder with compiled JavaScript.

### 2.3 Upload Backend Files via File Manager

1. **In hPanel** → **File Manager**
2. Navigate to `public_html/api` (or your subdomain folder)
3. Upload these files/folders:
   ```
   dist/           (compiled backend code)
   node_modules/   (all dependencies - this may take time!)
   package.json
   package-lock.json
   .env            (create this on server - see next step)
   ```

**Alternative (Faster) - Upload then install:**
1. Upload only: `dist/`, `package.json`, `package-lock.json`
2. Use SSH to run `npm install --production` (see SSH section)

### 2.4 Create Backend .env File

In File Manager, create `.env` file in `public_html/api/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Connection
DATABASE_URL=mysql://u123456789_pharma_user:YOUR_PASSWORD@localhost:3306/u123456789_parapharmacie

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-random-string
JWT_EXPIRES_IN=7d

# CORS - Your Frontend URL
FRONTEND_URL=https://store.yourdomain.com
```

**To generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.5 Configure Node.js Application

1. **In hPanel** → **Advanced** → **Node.js**
2. Click **Create Application**
3. Configure:
   - **Node.js Version**: 18.x or higher
   - **Application Mode**: Production
   - **Application Root**: `api` (or `public_html/api`)
   - **Application URL**: `https://api.yourdomain.com`
   - **Application Startup File**: `dist/server.js`
   - **Environment Variables**: Add variables from .env file
4. Click **Create**

### 2.6 Start the Application

1. In **Node.js** section, click **Run npm install**
2. Click **Start Application**
3. Check status - should show "Running"

### 2.7 Set Up Database Tables

**Option 1: Run Migration via SSH**
```bash
ssh u123456789@yourdomain.com
cd public_html/api
node dist/scripts/migrate.js
```

**Option 2: Run SQL Manually in phpMyAdmin**
1. Open phpMyAdmin from hPanel
2. Select your database
3. Go to SQL tab
4. Copy and paste contents from `backend/db/schema.mysql.sql`
5. Click "Go" to execute
6. Then copy and paste contents from `backend/db/seed.mysql.sql`
7. Click "Go" to execute

**Option 3: Upload SQL File**
1. In phpMyAdmin → Import tab
2. Upload `backend/db/schema.mysql.sql`
3. Then upload `backend/db/seed.mysql.sql`

---

## 🌐 Step 3: Set Up Frontend Subdomain (store.yourdomain.com)

### 3.1 Create Subdomain for Frontend
1. In **hPanel** → **Domains** → **Subdomains**
2. Click **Create Subdomain**
3. Enter subdomain: `store` (or `parapharmacie`)
4. It will create: `store.yourdomain.com`
5. Note the document root (usually `public_html/store`)

### 3.2 Update Frontend Environment

**Edit `.env` in project root:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 3.3 Build Frontend with Production API URL

```bash
# In project root (not backend folder)
npm run build
```

This creates/updates the `dist` folder with your frontend.

### 3.4 Upload Frontend Files

1. **In hPanel** → **File Manager**
2. Navigate to `public_html/store` (your frontend subdomain folder)
3. Upload **ALL contents** from `dist` folder:
   ```
   index.html
   assets/
   ```

### 3.5 Create .htaccess for React Router

In `public_html/store`, create `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

# Enable CORS for API requests
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "https://api.yourdomain.com"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

---

## 🔒 Step 4: Configure SSL Certificates

### 4.1 Enable SSL for Both Subdomains

1. In **hPanel** → **Security** → **SSL**
2. For **api.yourdomain.com**:
   - Select the subdomain
   - Install SSL certificate (Hostinger provides free Let's Encrypt)
   - Force HTTPS
3. Repeat for **store.yourdomain.com**

### 4.2 Update Backend CORS

Ensure your backend `.env` has:
```env
FRONTEND_URL=https://store.yourdomain.com
```

---

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend API

Open browser and visit:
```
https://api.yourdomain.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T..."
}
```

### 5.2 Test Database Connection

Visit:
```
https://api.yourdomain.com/api/products
```

Should return products (or empty array if no products yet).

### 5.3 Test Frontend

1. Visit: `https://store.yourdomain.com`
2. Check browser console (F12) - should be no CORS errors
3. Try navigating to different pages
4. Test login/register functionality
5. Test adding items to cart
6. Test placing an order

---

## 🐛 Troubleshooting

### Backend Not Starting

**Check Node.js logs:**
1. hPanel → **Node.js** → Click your app → **View Logs**
2. Common issues:
   - Missing dependencies → Run `npm install`
   - Wrong startup file → Check it's `dist/server.js`
   - Database connection error → Verify DATABASE_URL
   - Port already in use → Hostinger assigns port automatically

### Database Connection Errors

**"Connection refused" or "Authentication failed":**
1. Verify database credentials in `.env`
2. Check if database host is `localhost` or IP address
3. Ensure database user has permissions
4. Ensure you're using MySQL (port 3306), not PostgreSQL

### CORS Errors

**"CORS policy: No 'Access-Control-Allow-Origin' header":**
1. Verify `FRONTEND_URL` in backend `.env`
2. Check backend CORS middleware in `src/server.ts`
3. Ensure SSL is enabled on both subdomains
4. Check `.htaccess` CORS headers

### Frontend Shows Blank Page

1. Check browser console for errors
2. Verify API URL in frontend `.env` was correct when building
3. Check `.htaccess` is uploaded
4. Verify all `dist` files uploaded correctly
5. Clear browser cache

### 404 Errors on Page Refresh

- **Missing or incorrect `.htaccess`** - Re-upload the .htaccess file

---

##  Updating Your Application

### Update Backend:
1. Make changes locally
2. Run `npm run build`
3. Upload new `dist` folder via File Manager
4. In hPanel → **Node.js** → Restart application

### Update Frontend:
1. Update code locally
2. Run `npm run build`
3. Upload new `dist` contents to `public_html/store`
4. Clear browser cache to see changes

---

## 📊 Environment Variables Summary

### Frontend (.env):
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Backend (.env):
```env
PORT=5000
NODE_ENV=production
DATABASE_URL=mysql://username:password@localhost:3306/database_name
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://store.yourdomain.com
```

---

## 🎯 Quick Deployment Checklist

- [ ] Create MySQL database in hPanel
- [ ] Note database credentials
- [ ] Create `api` subdomain
- [ ] Build backend (`npm run build` in backend/)
- [ ] Upload backend files to `public_html/api`
- [ ] Create backend `.env` with database credentials
- [ ] Configure Node.js app in hPanel
- [ ] Run npm install and start backend
- [ ] Run database migrations (SQL via phpMyAdmin)
- [ ] Test backend API endpoint
- [ ] Enable SSL for api subdomain
- [ ] Create `store` subdomain
- [ ] Update frontend `.env` with API URL
- [ ] Build frontend (`npm run build` in root)
- [ ] Upload frontend dist to `public_html/store`
- [ ] Create `.htaccess` for React Router
- [ ] Enable SSL for store subdomain
- [ ] Test frontend loads correctly
- [ ] Test login and product functionality
- [ ] Verify no CORS errors

---

## 🆘 Need Help?

**Common Resources:**
- Hostinger Documentation: https://support.hostinger.com
- Node.js on Hostinger: Search "Node.js hosting Hostinger"
- Database Setup: Search "MySQL Hostinger"

**SSH Access (for advanced tasks):**
```bash
ssh u123456789@yourdomain.com
cd public_html/api
npm install
node dist/scripts/migrate.js
```

---

## 🚀 You're Done!

Your parapharmacie store should now be live at:
- **Frontend**: https://store.yourdomain.com
- **Backend API**: https://api.yourdomain.com/api

Happy selling! 🎉
