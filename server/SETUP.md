# Backend Setup Instructions

## ✅ Installation Complete!

Backend dependencies have been successfully installed with `bcryptjs` (pure JavaScript, no native compilation issues).

---

## 📋 Next Steps

### Option 1: Test Without Database (Quick Start)

If you want to test the backend immediately without setting up MySQL:

1. **Comment out database routes temporarily** and just test the health check
2. **Start the server**:
   ```powershell
   npm run dev
   ```
3. **Test in browser**: http://localhost:3000/api/health

### Option 2: Setup MySQL Database (Full Setup)

To use the full backend with MySQL:

#### Step 1: Setup Local MySQL (if testing locally)

**Option A: Install XAMPP (Easiest)**
1. Download XAMPP: https://www.apachefriends.org/
2. Install and start MySQL from XAMPP Control Panel
3. Update `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=benmina_local
   ```

**Option B: Use Hostinger MySQL Directly**
1. Get MySQL credentials from Hostinger Panel
2. Update `.env` file with Hostinger credentials
3. Make sure your IP is whitelisted in Hostinger (may require remote access setup)

#### Step 2: Create Database

```sql
-- In phpMyAdmin or MySQL CLI:
CREATE DATABASE benmina_local;
```

#### Step 3: Run Migration

```powershell
npm run migrate
```

This will create all tables and insert the admin user.

#### Step 4: Start Server

```powershell
npm run dev
```

Server runs on: http://localhost:3000

---

## 🧪 Testing

### Test Health Check
```powershell
# In browser or new terminal:
curl http://localhost:3000/api/health
```

### Test Login (after migration)
```powershell
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"benmina01ahmed@gmail.com\",\"password\":\"BenminaMedia2024!\"}"
```

### Test Projects Endpoint
```powershell
curl http://localhost:3000/api/projects
```

---

## 🔧 Configuration

Your `.env` file is ready with:
- ✅ JWT_SECRET (auto-generated)
- ✅ Admin credentials
- ✅ Development CORS origin (localhost:5173)

**You need to update:**
- `DB_PASSWORD` - Your MySQL password
- Or use XAMPP with empty password (default)

---

## 🚨 Current Status

- ✅ Dependencies installed (bcryptjs, not bcrypt - no compilation issues!)
- ✅ `.env` file created with JWT secret
- ⏳ Database not created yet (need to run migration)
- ⏳ Frontend not updated yet (still using SQL.js)

---

## ⚡ Quick Start (Skip Database for Now)

Want to just see the server run? Create a simple test endpoint:

1. **Create `server/test.js`**:
   ```javascript
   require('dotenv').config();
   const express = require('express');
   const app = express();
   
   app.get('/api/health', (req, res) => {
     res.json({ 
       status: 'ok', 
       timestamp: new Date().toISOString(),
       message: 'Backend is running!'
     });
   });
   
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
     console.log(`✅ Test server running on http://localhost:${PORT}`);
   });
   ```

2. **Run it**:
   ```powershell
   node test.js
   ```

3. **Test in browser**: http://localhost:3000/api/health

---

## 📖 Full Documentation

- **Backend Deployment**: See `../BACKEND_DEPLOYMENT.md`
- **Migration Guide**: See `../MIGRATION_GUIDE.md`
- **Quick Reference**: See `../QUICK_REFERENCE.md`

---

## ❓ Troubleshooting

### Error: "Cannot find module 'bcrypt'"
✅ **FIXED** - We replaced `bcrypt` with `bcryptjs` (no native compilation needed on Windows)

### Error: "ER_ACCESS_DENIED_ERROR"
- Check your MySQL credentials in `.env`
- Make sure MySQL server is running

### Error: "ECONNREFUSED"
- MySQL is not running
- Start XAMPP MySQL or connect to Hostinger

---

## 🎯 Recommended Path

1. **Test locally with XAMPP** (easiest setup)
2. **Update frontend** to use REST API
3. **Test everything locally**
4. **Deploy to Hostinger** (follow BACKEND_DEPLOYMENT.md)

Good luck! 🚀
