# 🎨 Sale Banners Database Setup

## ⚠️ IMPORTANT: You must run this SQL before using the banner management feature!

The banner system requires a `sale_banners` table in your **Hostinger MySQL database**.

---

## 📋 Step-by-Step Instructions

### 1️⃣ Login to Hostinger
- Go to your Hostinger control panel
- Navigate to **Databases** → **phpMyAdmin**

### 2️⃣ Select Your Database
- Click on database: `u894306996_harbi`

### 3️⃣ Run the SQL Script
- Click the **SQL** tab at the top
- Copy and paste the SQL below
- Click **Execute** (or **Go**)

---

## 📝 SQL Script to Run

```sql
-- Create sale_banners table
CREATE TABLE IF NOT EXISTS sale_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255) DEFAULT NULL,
  discount_text VARCHAR(100) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  background_color VARCHAR(50) DEFAULT 'from-red-500 to-orange-500',
  button_text VARCHAR(50) DEFAULT 'Shop Now',
  button_link VARCHAR(255) DEFAULT '#',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample promotional banners
INSERT INTO sale_banners (title, subtitle, discount_text, description, image_url, background_color, button_text, button_link, display_order, is_active) VALUES
('MEGA SALE', 'Limited Time Offer', '50% OFF', 'Get amazing discounts on all parapharmacie products', 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=1200', 'from-red-500 via-pink-500 to-orange-500', 'Shop Now', '/products', 1, TRUE),
('Vitamins & Supplements', 'Health First', 'BUY 2 GET 1 FREE', 'Stock up on your favorite vitamins and supplements', 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1200', 'from-green-500 via-emerald-500 to-teal-500', 'Browse Products', '/products?category=2', 2, TRUE),
('New Arrivals', 'Fresh Stock', '30% OFF', 'Discover our latest collection of premium products', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200', 'from-purple-600 via-blue-600 to-indigo-600', 'View Collection', '/products', 3, TRUE);

-- Verify the table was created
SELECT COUNT(*) as total_banners FROM sale_banners;
```

---

## ✅ Expected Results

After running the SQL, you should see:
- **Message:** "3 rows affected" or "3 rows inserted"
- **Query:** Shows `total_banners: 3`
- **Left sidebar:** `sale_banners` table appears in the table list

---

## 🧪 Test the Banner System

### 1. **Check Homepage**
- Go to: https://harbi.benmina.com
- You should see 3 promotional banners in the carousel

### 2. **Access Admin Panel**
- Login as admin: `admin@exemple.com` / `admin123`
- Navigate to: **Admin** → **Banners**
- You should see the 3 sample banners

### 3. **Test CRUD Operations**
- ✅ **Create:** Click "Add New Banner" button
- ✅ **Edit:** Click the blue edit button on any banner
- ✅ **Delete:** Click the red delete button on any banner

---

## 🚨 Troubleshooting

### Error: "Table 'u894306996_harbi.sale_banners' doesn't exist"
**Solution:** You haven't run the SQL script yet. Follow steps 1-3 above.

### Error: "Failed to load banners"
**Possible causes:**
1. Not logged in as admin
2. Table doesn't exist (run SQL script)
3. Wrong database credentials

**Fix:**
- Ensure you're logged in with admin account
- Verify table exists in phpMyAdmin
- Check Railway environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)

### Error: "Access denied" or "Forbidden"
**Solution:** 
- You need to login with admin role
- Check `users` table → ensure your user has `role = 'admin'`
- Run ADMIN-FIX-COMPLETE.sql if admin user doesn't exist

### Banners don't show on homepage
**Check:**
1. At least one banner has `is_active = TRUE`
2. Browser cache - do hard refresh (Ctrl+Shift+R)
3. Console errors in browser DevTools

---

## 📊 Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Auto-increment primary key |
| `title` | VARCHAR(255) | Main banner title (required) |
| `subtitle` | VARCHAR(255) | Small badge text above title |
| `discount_text` | VARCHAR(100) | Large discount display (e.g., "50% OFF") |
| `description` | TEXT | Banner description text |
| `image_url` | TEXT | Background image URL |
| `background_color` | VARCHAR(50) | Tailwind gradient classes |
| `button_text` | VARCHAR(50) | Call-to-action button text |
| `button_link` | VARCHAR(255) | Where button redirects |
| `display_order` | INT | Sort order (lower = first) |
| `is_active` | BOOLEAN | Show on homepage? |
| `created_at` | TIMESTAMP | Auto-set on creation |
| `updated_at` | TIMESTAMP | Auto-update on changes |

---

## 🎨 Available Gradient Colors

When creating/editing banners, choose from:

1. **Red/Pink/Orange** - `from-red-500 via-pink-500 to-orange-500`
2. **Green/Emerald/Teal** - `from-green-500 via-emerald-500 to-teal-500`
3. **Purple/Blue/Indigo** - `from-purple-600 via-blue-600 to-indigo-600`
4. **Yellow/Orange/Red** - `from-yellow-400 via-orange-500 to-red-500`
5. **Pink/Purple/Indigo** - `from-pink-500 via-purple-500 to-indigo-500`
6. **Cyan/Blue/Purple** - `from-cyan-500 via-blue-500 to-purple-600`

---

## 💡 Tips

- **Display Order:** Lower numbers appear first (0, 1, 2, 3...)
- **Active Status:** Only active banners show on homepage
- **Image URLs:** Use high-quality images (1200px+ width)
- **Free Images:** Unsplash, Pexels, or your own uploaded images
- **Button Links:** Use `/products?category=X` to filter by category

---

## 📞 Need Help?

If you still have issues after running the SQL:
1. Check Railway logs for error messages
2. Verify database connection in Railway environment variables
3. Ensure you're using the correct database (Hostinger, not Railway)
4. Check browser console (F12) for JavaScript errors

---

**Last Updated:** November 15, 2025
