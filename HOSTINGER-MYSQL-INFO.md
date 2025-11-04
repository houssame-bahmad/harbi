# 🗄️ YOUR HOSTINGER MYSQL DATABASE INFO

## Database Credentials

```
Database Name: u894306996_harbi
MySQL User:    u894306996_harbi
Access Host:   % (allows remote connections)
Port:          3306
```

## 🔍 Finding Your MySQL Host

Your MySQL host is typically: `srv####.hstgr.io`

**To find it:**
1. Login to Hostinger cPanel
2. Go to **Remote MySQL** section
3. Look for "Add Access Host" - the host will be shown there
4. Common hosts:
   - `srv1268.hstgr.io`
   - `srv1234.hstgr.io`
   - Or check your MySQL connection string in cPanel

## 🔑 Getting Your MySQL Password

**If you don't have the password:**

1. Go to cPanel → **MySQL Databases**
2. Scroll to **Current Users** section
3. Find user: `u894306996_harbi`
4. Click **Change Password** next to it
5. Generate a strong password or enter your own
6. **IMPORTANT**: Save this password - you'll need it for Railway!

## ✅ Enable Remote Access

**CRITICAL STEP** - Without this, Railway can't connect!

1. In cPanel → **Remote MySQL**
2. In "Add Access Host" field, enter: `%`
3. Click **Add Host**
4. You should see `%` in the access hosts list

**What this means:**
- `%` = Allow connections from any IP address
- This is needed for Railway to connect
- Your database is still password-protected

## 🧪 Test Connection Locally

Before deploying to Railway, test from your local machine:

```powershell
cd backend

# Create .env file with your Hostinger credentials
notepad .env

# Add these lines (replace with your actual password):
DB_HOST=srv1268.hstgr.io
DB_PORT=3306
DB_USER=u894306996_harbi
DB_PASSWORD=YOUR_ACTUAL_PASSWORD
DB_NAME=u894306996_harbi

# Test the connection
npm install
node test-hostinger-db.js
```

## 📊 Upload Database Schema

**Via phpMyAdmin:**

1. cPanel → **phpMyAdmin**
2. Click on database: `u894306996_harbi`
3. Click **Import** tab
4. Choose file: `backend/db/schema.mysql.sql`
5. Click **Go** button
6. Wait for success message

**What this does:**
- Creates tables: users, products, categories, orders, etc.
- Sets up relationships between tables
- Creates indexes for better performance

## 🌱 (Optional) Add Sample Data

After importing schema, you can add test data:

1. Still in phpMyAdmin
2. Click **Import** tab again
3. Choose file: `backend/db/seed.mysql.sql`
4. Click **Go**

**This adds:**
- Sample products
- Categories
- A test admin user

## 🔐 Important Security Notes

1. **Never commit passwords** to Git
2. Use strong passwords (min 16 chars, mixed case, numbers, symbols)
3. Railway will store credentials as encrypted environment variables
4. Your frontend will only talk to Railway backend (not directly to MySQL)

## 📝 Quick Reference for Railway

Copy these values when setting up Railway environment variables:

```
DB_HOST = [Your srv####.hstgr.io]
DB_PORT = 3306
DB_USER = u894306996_harbi
DB_PASSWORD = [Your MySQL password]
DB_NAME = u894306996_harbi
```

## ✅ Checklist

- [ ] Found MySQL host (srv####.hstgr.io)
- [ ] Got/reset MySQL password
- [ ] Enabled Remote MySQL (% host)
- [ ] Uploaded schema.mysql.sql
- [ ] (Optional) Uploaded seed.mysql.sql
- [ ] Tested connection locally
- [ ] Ready to deploy to Railway!

---

**Next:** Open `DEPLOY-NOW.md` and follow the Railway deployment steps!
