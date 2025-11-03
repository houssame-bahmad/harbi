# ⚡ Quick Subdomain Deployment - Hostinger

**Target:**
- Frontend: `store.yourdomain.com`
- Backend: `api.yourdomain.com`
- Database: PostgreSQL on Hostinger

---

## 🎯 30-Minute Deployment Guide

### Part 1: Database (5 minutes)

1. **hPanel → Databases → Create Database**
   - Name: `parapharmacie_db`
   - User: Create new user
   - Password: Generate strong password
   - **Save credentials!**

2. **Check database type:**
   - PostgreSQL ✅ Continue
   - MySQL only ⚠️ See full guide for alternatives

---

### Part 2: Backend Setup (10 minutes)

1. **Create API Subdomain**
   - hPanel → Subdomains → Create
   - Subdomain: `api`
   - Result: `api.yourdomain.com`

2. **Build Backend Locally**
   ```bash
   cd backend
   npm run build
   ```

3. **Upload to Hostinger**
   - File Manager → `public_html/api`
   - Upload: `dist/`, `package.json`, `package-lock.json`

4. **Create .env File**
   File Manager → Create `.env` in `public_html/api`:
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgresql://YOUR_USER:YOUR_PASS@localhost:5432/YOUR_DB
   JWT_SECRET=GENERATE_32_CHAR_SECRET
   FRONTEND_URL=https://store.yourdomain.com
   JWT_EXPIRES_IN=7d
   ```

5. **Configure Node.js App**
   - hPanel → Node.js → Create Application
   - Root: `api`
   - Startup: `dist/server.js`
   - Version: 18.x
   - Run npm install → Start

6. **Setup Database Tables**
   SSH or phpPgAdmin:
   ```bash
   ssh youruser@yourdomain.com
   cd public_html/api
   node dist/scripts/migrate.js
   ```

7. **Enable SSL**
   - hPanel → SSL → Install for `api.yourdomain.com`

8. **Test**
   Visit: `https://api.yourdomain.com/api/health`

---

### Part 3: Frontend Setup (10 minutes)

1. **Create Frontend Subdomain**
   - hPanel → Subdomains → Create
   - Subdomain: `store`
   - Result: `store.yourdomain.com`

2. **Update .env Locally**
   ```env
   VITE_API_URL=https://api.yourdomain.com/api
   ```

3. **Build Frontend**
   ```bash
   npm run build
   ```

4. **Upload to Hostinger**
   - File Manager → `public_html/store`
   - Upload ALL from `dist/`: `index.html`, `assets/`

5. **Create .htaccess**
   File Manager → Create `.htaccess` in `public_html/store`:
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
   ```

6. **Enable SSL**
   - hPanel → SSL → Install for `store.yourdomain.com`

7. **Test**
   - Visit: `https://store.yourdomain.com`
   - Check console for errors
   - Test login/products

---

### Part 4: Final Testing (5 minutes)

✅ **Backend Checklist:**
- [ ] `https://api.yourdomain.com/api/health` returns `{"status":"ok"}`
- [ ] `https://api.yourdomain.com/api/products` returns data
- [ ] No errors in Node.js logs (hPanel → Node.js → Logs)

✅ **Frontend Checklist:**
- [ ] `https://store.yourdomain.com` loads
- [ ] No CORS errors in browser console (F12)
- [ ] Can navigate between pages
- [ ] Products load from API
- [ ] Login/register works

✅ **Security Checklist:**
- [ ] SSL enabled on both subdomains (🔒 in browser)
- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] Database password is strong
- [ ] `.env` files not publicly accessible

---

## 🔧 Quick Commands

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**SSH to Hostinger:**
```bash
ssh u123456789@yourdomain.com
```

**Check Backend Logs:**
```bash
cd public_html/api
pm2 logs
```

**Restart Backend:**
hPanel → Node.js → Click app → Restart

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Node.js logs in hPanel |
| CORS errors | Verify FRONTEND_URL in backend .env |
| Database connection failed | Check DATABASE_URL credentials |
| Blank frontend page | Check browser console, verify .htaccess |
| 404 on page refresh | Upload .htaccess file |
| API 500 errors | Run database migrations |

---

## 📁 File Structure

```
Hostinger File Manager:
├── public_html/
│   ├── api/                          ← Backend subdomain
│   │   ├── dist/
│   │   │   ├── server.js
│   │   │   └── ...
│   │   ├── node_modules/
│   │   ├── package.json
│   │   └── .env                      ← Backend config
│   │
│   └── store/                        ← Frontend subdomain
│       ├── assets/
│       ├── index.html
│       └── .htaccess                 ← React Router config
```

---

## 🚀 Done!

- **Frontend**: https://store.yourdomain.com
- **Backend**: https://api.yourdomain.com/api

For detailed instructions, see: `SUBDOMAIN-DEPLOY.md`
