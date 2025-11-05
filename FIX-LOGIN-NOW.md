# 🔐 CREATE ADMIN USER IN RAILWAY

## The Issue
Login is failing with 401 error because there's no admin user in the database.

## ✅ QUICK FIX (2 minutes)

### Step 1: Open Railway MySQL Console
1. Go to https://railway.app
2. Open your project (web-production-5b48e)
3. Click on **MySQL** service
4. Click **Data** tab or **Connect**

### Step 2: Run This SQL
Copy and paste this into Railway MySQL console:

```sql
-- Create admin user
INSERT INTO users (id, email, password, role, full_name, created_at)
VALUES (
  UUID(),
  'admin@exemple.com',
  '$2a$10$0eAO7aEvnfijwr13vT3fkuOtxglNfkCpRvn5Uq6KnFeto2aeMUgde',
  'admin',
  'Administrator',
  NOW()
) ON DUPLICATE KEY UPDATE email=email;

-- Verify it worked
SELECT id, email, role, full_name, created_at FROM users WHERE email = 'admin@exemple.com';
```

### Step 3: Test Login
1. Go to https://harbi.benmina.com
2. Click Login
3. Use these credentials:
   - **Email**: `admin@exemple.com`
   - **Password**: `admin123`
4. You should be logged in successfully! 🎉

---

## 👥 AVAILABLE TEST USERS

### Admin User
- **Email**: admin@exemple.com
- **Password**: admin123
- **Role**: Admin (full access)

### Customer User
- **Email**: customer@exemple.com  
- **Password**: customer123
- **Role**: Customer (can place orders)

To create the customer user too, run the full SQL from:
`server/migrations/ecommerce_schema.sql`

---

## 📝 NOTES

- The password hashes are pre-generated using bcrypt
- The SQL uses `ON DUPLICATE KEY UPDATE` so it's safe to run multiple times
- UUID() automatically generates unique user IDs
- You can change the password later by generating a new hash

---

## 🔧 To Generate Your Own Password Hash

If you want a different password:

```bash
cd server
node generate-hash.js
```

Then update the SQL with the new hash.

---

**That's it! Run the SQL above and you'll be able to log in!** 🚀
