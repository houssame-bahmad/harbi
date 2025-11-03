# Parapharmacie Store - Quick Start Guide

## 🎯 For Development (Local Testing)

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
# From root directory
npm install
```

### 2. Setup Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/parapharmacie_db
JWT_SECRET=your-dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:3001
JWT_EXPIRES_IN=7d
```

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Setup PostgreSQL Database

**Option A: Use existing mockApi (No database needed)**
- The app currently uses localStorage for data
- You can skip database setup for testing
- To use: Just run the frontend

**Option B: Setup PostgreSQL (For production-ready app)**
```powershell
# Create database
createdb parapharmacie_db

# Run migrations from root directory
cd backend
# Update your DATABASE_URL in .env first
# Then run:
npm run migrate
```

### 4. Run the Application

**Development with mockApi (Easiest):**
```powershell
# Just run the frontend
npm run dev
# Open http://localhost:3001
```

**Development with real backend:**
```powershell
# Terminal 1 - Backend
cd backend
npm run dev
# Backend runs on http://localhost:5000

# Terminal 2 - Frontend (from root)
npm run dev
# Frontend runs on http://localhost:3001
```

---

## 🚀 For Production Deployment

### Quick Deployment Steps:

1. **Backend to Railway:**
   - Push code to GitHub
   - Create Railway project
   - Add PostgreSQL database
   - Set environment variables
   - Deploy automatically

2. **Frontend to Vercel:**
   - Import GitHub repository
   - Set `VITE_API_URL` environment variable
   - Deploy automatically

**Detailed instructions:** See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧪 Test Accounts

```
Admin:
  Email: admin@example.com
  Password: admin123

Regular User:
  Email: user@example.com
  Password: user123

Delivery Person:
  Email: delivery@example.com
  Password: delivery123
```

---

## 📝 Common Issues

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check `.env` file has correct `VITE_API_URL`
- Restart Vite dev server after changing .env

### Database connection failed
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Ensure database exists: `createdb parapharmacie_db`

### TypeScript errors in backend
- Run `cd backend && npm install`
- Delete `node_modules` and reinstall
- Check `tsconfig.json` is present

---

## 📂 Project Overview

```
parapharmacie-store/
├── backend/              # Express API (Port 5000)
├── services/
│   ├── mockApi.ts       # Current localStorage implementation
│   └── api.ts           # New HTTP client for backend
├── App.tsx              # Main React app
└── ... (other frontend files)
```

---

## 🔄 Switching from mockApi to Real Backend

To switch your frontend from using mockApi to the real backend:

1. In `App.tsx`, replace mockApi imports:
```typescript
// Old:
import { mockApi } from './services/mockApi';

// New:
import api from './services/api';
```

2. Update all `mockApi.*` calls to `api.*`

3. Ensure backend is running and `.env` is configured

---

## ✅ Success Indicators

**Frontend working:**
- ✅ Opens on http://localhost:3001
- ✅ Can browse products
- ✅ Can add to cart

**Backend working:**
- ✅ Health check: http://localhost:5000/health returns `{"status":"ok"}`
- ✅ No errors in backend console
- ✅ Can login via API

**Full stack working:**
- ✅ Can register new user
- ✅ Can login and get JWT token
- ✅ Can create orders
- ✅ Admin can manage products

---

Need help? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guides!
