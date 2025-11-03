# ⚡ Quick Hostinger Deployment

## 5-Minute Deploy Guide

### 1️⃣ Configure Environment (1 min)
```powershell
# Update .env with your Railway backend URL
# .env file:
VITE_API_URL=https://your-backend.railway.app/api
```

### 2️⃣ Build (2 min)
```powershell
npm install
npm run build
```
✅ Creates `dist/` folder with production files

### 3️⃣ Upload to Hostinger (2 min)
1. **Login:** https://hpanel.hostinger.com
2. **File Manager** → `public_html`
3. **Delete** default files
4. **Upload** all from `dist/`:
   - `index.html`
   - `assets/` folder (entire folder)

### 4️⃣ Create .htaccess
In `public_html`, create file `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 5️⃣ Update Backend CORS
Railway → Backend → Variables:
```
FRONTEND_URL=https://yourdomain.com
```

### 6️⃣ Test!
Visit: `https://yourdomain.com`

---

## ✅ Quick Checklist
- [ ] `.env` has Railway API URL
- [ ] `npm run build` completed
- [ ] All `dist/` files uploaded
- [ ] `.htaccess` created
- [ ] Backend `FRONTEND_URL` updated
- [ ] Site loads with products

---

## 🆘 Common Issues

**404 on refresh?**
→ Add/check `.htaccess` file

**CORS errors?**
→ Update `FRONTEND_URL` in Railway, wait 2 min

**Blank page?**
→ Check F12 Console for errors, verify API URL

---

**📖 Full Guide:** [HOSTINGER-DEPLOY.md](./HOSTINGER-DEPLOY.md)
