# 🗄️ MySQL Deployment Guide
## Complete Guide for Using MySQL Database

This guide covers converting the backend from PostgreSQL to MySQL and deploying with MySQL database.

---

## ✅ What's Been Done

The backend has been updated to support MySQL:

1. ✅ **Package updated** - `mysql2` replaces `pg`
2. ✅ **Database config** - Updated to use `mysql2/promise`
3. ✅ **MySQL schemas** - Created `schema.mysql.sql` and `seed.mysql.sql`
4. ✅ **Migration script** - Updated to work with MySQL
5. ⚠️ **Route files** - Need manual SQL query updates (see below)

---

## 🔧 Step 1: Complete Route Files MySQL Conversion

The route files still need to be updated from PostgreSQL (`$1`, `$2`) to MySQL (`?`) placeholders.

### Files to Update:

1. **backend/src/routes/products.ts**
2. **backend/src/routes/orders.ts**
3. **backend/src/routes/users.ts**

### Quick Fix Guide:

Replace PostgreSQL parameterized queries:
```typescript
// FROM (PostgreSQL):
pool.query('SELECT * FROM products WHERE id = $1', [id])

// TO (MySQL):
import { query } from '../config/database';
query('SELECT * FROM products WHERE id = ?', [id])
```

**Key Changes:**
- Import `query` from `'../config/database'` instead of `pool`
- Replace `$1, $2, $3...` with `?` placeholders
- Column names: `password_hash` → `password`, `full_name` → `name`, etc.

---

## 🎯 Step 2: Choose Your MySQL Deployment Option

### Option A: Hostinger MySQL (Recommended if using Hostinger)

**Pros:**
- Included with most Hostinger plans
- Easy to manage via hPanel
- No extra cost

**Cons:**
- Remote connections may be limited
- Less powerful than dedicated database services

### Option B: Railway MySQL

**Pros:**
- Free tier available
- Auto-scaling
- Easy remote access

**Cons:**
- Free tier has limits
- Requires separate service

### Option C: PlanetScale (MySQL-compatible)

**Pros:**
- Generous free tier
- Serverless MySQL
- Excellent performance

**Cons:**
- Requires separate account

---

## 🌐 Deployment Option 1: Hostinger Subdomain + Hostinger MySQL

### Step 1: Create MySQL Database on Hostinger

1. **Login to hPanel** → Databases
2. **Click "Create Database"**
3. Fill in details:
   - Database name: `parapharmacie_db`
   - Username: Create new user
   - Password: Generate strong password
4. **Save these credentials!**

Example credentials you'll get:
```
Host: localhost
Database: u123456789_parapharmacie
Username: u123456789_pharma
Password: [your-password]
Port: 3306
```

### Step 2: Update Backend .env

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=mysql://u123456789_pharma:YOUR_PASSWORD@localhost:3306/u123456789_parapharmacie
JWT_SECRET=your-generated-secret-32-chars
FRONTEND_URL=https://store.yourdomain.com
JWT_EXPIRES_IN=7d
```

### Step 3: Deploy Backend

1. **Build backend locally:**
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Upload to Hostinger** (`public_html/api`):
   - `dist/`
   - `db/` (schema and seed files)
   - `node_modules/`
   - `package.json`
   - `.env`

3. **Configure Node.js in hPanel:**
   - Application root: `api`
   - Startup file: `dist/server.js`
   - Node version: 18.x+

4. **Run migrations:**
   Via SSH:
   ```bash
   ssh youruser@yourdomain.com
   cd public_html/api
   node dist/scripts/migrate.js
   ```

   Or manually via phpMyAdmin:
   - Copy SQL from `db/schema.mysql.sql`
   - Execute in phpMyAdmin
   - Copy SQL from `db/seed.mysql.sql`
   - Execute in phpMyAdmin

---

## 🚀 Deployment Option 2: Hostinger Subdomain + Railway MySQL

This combines Hostinger frontend with Railway backend AND MySQL!

### Step 1: Deploy Backend to Railway

1. **Go to railway.app** → Sign in with GitHub
2. **New Project** → Deploy from GitHub → Select your repo
3. **Set root directory** to `backend`

### Step 2: Add MySQL Database on Railway

1. **Click "+ New"** → Database → **Add MySQL**
2. Railway creates MySQL instance automatically
3. `DATABASE_URL` is auto-injected!

### Step 3: Set Environment Variables

In Railway, add:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-generated-secret
FRONTEND_URL=https://store.yourdomain.com
JWT_EXPIRES_IN=7d
```

`DATABASE_URL` is already set by Railway!

### Step 4: Run Migrations

**Option A: Railway CLI**
```bash
railway login
railway link
railway run node dist/scripts/migrate.js
```

**Option B: Temporary endpoint** (add to src/server.ts):
```typescript
app.get('/api/setup-db', async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const migrate = spawn('node', ['dist/scripts/migrate.js']);
    
    migrate.stdout.on('data', (data: any) => console.log(data.toString()));
    migrate.stderr.on('data', (data: any) => console.error(data.toString()));
    
    migrate.on('close', (code: number) => {
      if (code === 0) {
        res.json({ success: true, message: 'Database migrated!' });
      } else {
        res.status(500).json({ error: 'Migration failed' });
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

Then visit: `https://your-app.up.railway.app/api/setup-db`
**Remove this endpoint after migration!**

### Step 5: Deploy Frontend to Hostinger

Follow the standard Hostinger subdomain deployment (see HYBRID-DEPLOY.md Part 2).

---

## 🔧 Local Development with MySQL

### Install MySQL Locally

**Windows:**
1. Download MySQL from https://dev.mysql.com/downloads/installer/
2. Install MySQL Server
3. Set root password during installation

**Mac (Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Linux:**
```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

### Create Local Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE parapharmacie_db;
CREATE USER 'pharma_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON parapharmacie_db.* TO 'pharma_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Update Local .env

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mysql://pharma_user:your_password@localhost:3306/parapharmacie_db
JWT_SECRET=dev-secret-change-me
FRONTEND_URL=http://localhost:3001
JWT_EXPIRES_IN=7d
```

### Run Migrations

```bash
cd backend
npm run migrate
```

---

## 📊 Database Schema Differences

### PostgreSQL vs MySQL

| Feature | PostgreSQL | MySQL |
|---------|-----------|-------|
| Serial/Auto-increment | `SERIAL` | `AUTO_INCREMENT` |
| Boolean | `BOOLEAN` | `TINYINT(1)` or `BOOLEAN` |
| Text | `TEXT` | `TEXT` |
| JSON | `JSONB` | `JSON` |
| Enums | `CREATE TYPE` | `ENUM('val1', 'val2')` |
| Returning | `RETURNING *` | Use `LAST_INSERT_ID()` |
| Placeholders | `$1, $2, $3` | `?, ?, ?` |

### Our MySQL Schema

Tables created:
- **users** - User accounts (USER, ADMIN, DELIVERY roles)
- **products** - Product catalog
- **orders** - Customer orders
- **order_items** - Order line items

All use `InnoDB` engine with `utf8mb4` encoding for emoji support!

---

## 🧪 Testing MySQL Connection

### Test 1: Direct Connection

Create `test-db.js` in backend folder:

```javascript
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection(
      'mysql://root:password@localhost:3306/parapharmacie_db'
    );
    console.log('✅ MySQL connected!');
    
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Test query:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run: `node test-db.js`

### Test 2: Backend API

Start backend:
```bash
cd backend
npm run dev
```

Visit: `http://localhost:5000/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## 🐛 Troubleshooting

### "Client does not support authentication protocol"

**Error:** `ER_NOT_SUPPORTED_AUTH_MODE`

**Solution:**
```sql
ALTER USER 'your_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### "Access denied for user"

**Solutions:**
1. Check username/password in DATABASE_URL
2. Verify user exists: `SELECT User, Host FROM mysql.user;`
3. Grant permissions: `GRANT ALL ON database.* TO 'user'@'localhost';`

### "Unknown database"

**Solution:**
```sql
CREATE DATABASE parapharmacie_db;
```

### "Table doesn't exist"

**Solution:**
Run migrations:
```bash
node dist/scripts/migrate.js
```

Or manually run SQL from `db/schema.mysql.sql`

### Connection timeouts

**Solutions:**
1. Check MySQL is running: `sudo systemctl status mysql`
2. Check port 3306 is open
3. Verify firewall settings
4. For remote connections, enable remote access in MySQL config

---

## 📦 Environment Variables Summary

### Local Development
```env
DATABASE_URL=mysql://root:password@localhost:3306/parapharmacie_db
```

### Hostinger MySQL
```env
DATABASE_URL=mysql://u123_user:pass@localhost:3306/u123_database
```

### Railway MySQL
```env
# Auto-set by Railway, but format is:
DATABASE_URL=mysql://root:pass@containers-us-west-xxx.railway.app:3306/railway
```

### PlanetScale
```env
DATABASE_URL=mysql://user:pass@us-east.connect.psdb.cloud/database?ssl={"rejectUnauthorized":true}
```

---

## ✅ MySQL Deployment Checklist

- [ ] Install `mysql2` package
- [ ] Update `database.ts` config
- [ ] Create MySQL schema (`schema.mysql.sql`)
- [ ] Create MySQL seed data (`seed.mysql.sql`)
- [ ] Update migration script
- [ ] Update all route files (products, orders, users)
- [ ] Update .env files
- [ ] Create MySQL database (local or hosting)
- [ ] Run migrations
- [ ] Test database connection
- [ ] Test API endpoints
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Test full application

---

## 🎯 Quick Migration Commands

```bash
# Install MySQL driver
npm install mysql2

# Build backend
npm run build

# Run migrations
npm run migrate

# Test connection
node -e "require('mysql2/promise').createConnection('mysql://root:password@localhost:3306/test').then(()=>console.log('✅ Connected')).catch(e=>console.error('❌',e.message))"
```

---

## 📚 Additional Resources

- **MySQL Documentation**: https://dev.mysql.com/doc/
- **mysql2 NPM Package**: https://www.npmjs.com/package/mysql2
- **Hostinger MySQL Guide**: https://support.hostinger.com/en/articles/1583429-how-to-manage-mysql-databases
- **Railway MySQL**: https://docs.railway.app/databases/mysql

---

## 🎉 Ready to Deploy!

Once you've completed the route file updates, you're ready to deploy with MySQL!

Choose your deployment path:
- **Hostinger subdomain + Hostinger MySQL** - All in one place
- **Hostinger subdomain + Railway MySQL** - Best of both worlds

For step-by-step deployment, see **HYBRID-DEPLOY.md**!
