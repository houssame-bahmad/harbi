# 🎨 Sale Banner Management System - Complete Guide

## ✅ What Was Created

### 1. **Database Schema** (`sale_banners` table)
- Stores promotional banners with customizable colors, text, and images
- Fields: title, subtitle, discountText, description, imageUrl, backgroundColor, buttonText, buttonLink, isActive, displayOrder

### 2. **Backend API** (`/api/banners`)
- GET `/api/banners` - Public endpoint for active banners
- GET `/api/banners/all` - Admin endpoint for all banners
- POST `/api/banners` - Create new banner (admin only)
- PUT `/api/banners/:id` - Update banner (admin only)
- DELETE `/api/banners/:id` - Delete banner (admin only)

### 3. **Admin Management Interface**
- Location: `/admin/banners`
- Features:
  - Visual banner previews with live gradient backgrounds
  - Add/Edit/Delete banners
  - Toggle active/inactive status
  - Set display order
  - Choose from 6 pre-defined gradient color schemes
  - Upload custom images
  - Edit all banner text and links

### 4. **Homepage Display**
- Automatically loads and displays active banners from database
- Responsive grid layout (1/2/3 columns)
- Hover animations and effects
- Support for background images
- Clickable buttons with custom links

---

## 📋 Setup Instructions

### Step 1: Create Database Table
1. Go to **Railway Dashboard** → Your Project → **MySQL** tab
2. Click **Query** button
3. Copy and paste the contents of `RUN-IN-RAILWAY-BANNERS.sql`
4. Click **Execute**
5. You should see 3 sample banners created

### Step 2: Access Admin Panel
1. Make sure you're logged in as admin (`admin@exemple.com` / `admin123`)
2. You should see a new **"Banners"** link in the top navigation
3. Click it to access `/admin/banners`

### Step 3: Manage Banners
**To Add a Banner:**
1. Click "Add New Banner" button
2. Fill in the form:
   - **Title** (required): Main heading (e.g., "MEGA SALE")
   - **Subtitle**: Small text above title (e.g., "Limited Time")
   - **Discount Text**: Large promotional text (e.g., "50% OFF")
   - **Description**: Additional info (e.g., "On selected products")
   - **Image URL**: Optional background image
   - **Background Color**: Choose from 6 gradient options
   - **Button Text**: Call-to-action text (e.g., "Shop Now")
   - **Button Link**: URL to navigate to (e.g., "#" or "/products")
   - **Display Order**: Number for sorting (lower = first)
   - **Active**: Check to display on homepage
3. Click "Create Banner"

**To Edit a Banner:**
1. Hover over a banner card
2. Click the blue **edit icon** (pencil)
3. Modify fields
4. Click "Update Banner"

**To Delete a Banner:**
1. Hover over a banner card
2. Click the red **delete icon** (trash)
3. Confirm deletion

**To Reorder Banners:**
- Change the "Display Order" number when editing
- Lower numbers appear first (left to right)

---

## 🎨 Available Gradient Colors

1. **Red/Pink/Orange** - `from-red-500 via-pink-500 to-orange-500`
2. **Green/Emerald/Teal** - `from-green-500 via-emerald-500 to-teal-500`
3. **Purple/Blue/Indigo** - `from-purple-600 via-blue-600 to-indigo-600`
4. **Yellow/Orange/Red** - `from-yellow-400 via-orange-500 to-red-500`
5. **Pink/Purple/Indigo** - `from-pink-500 via-purple-500 to-indigo-500`
6. **Cyan/Blue/Purple** - `from-cyan-500 via-blue-500 to-purple-600`

---

## 📸 How to Add Images

### Option 1: Upload to Media Library (Recommended)
1. Use the existing media upload feature at `/api/media/upload`
2. Get the returned URL
3. Paste it in the "Image URL" field

### Option 2: Use External URLs
- Unsplash: `https://images.unsplash.com/photo-xxxxx?w=800`
- Imgur: `https://i.imgur.com/xxxxx.jpg`
- Your own hosting

**Note:** Images are displayed at 30% opacity behind the gradient and text.

---

## 🔧 Technical Details

### Frontend Components
- **BannerManagementPage** (`App.tsx`): Admin interface
- **HomePage** (`App.tsx`): Dynamic banner display
- **SaleBanner** type (`types.ts`): TypeScript interface

### Backend Files
- **routes/banners.js**: API endpoints
- **migrations/add_sale_banners.sql**: Database schema
- **server.js**: Route registration

### API Integration
- **services/api.ts**: 
  - `getAllBanners()` - Fetch active banners
  - `getAllBannersAdmin()` - Fetch all banners
  - `createBanner()` - Create new
  - `updateBanner()` - Update existing
  - `deleteBanner()` - Remove banner

---

## ✨ Features

✅ **Visual Editor** - See banner preview while editing
✅ **Drag-free Ordering** - Simple numeric ordering
✅ **Active/Inactive Toggle** - Hide banners without deleting
✅ **Gradient Presets** - 6 beautiful color combinations
✅ **Image Support** - Optional background images
✅ **Responsive Design** - Works on mobile, tablet, desktop
✅ **Hover Animations** - Scale and shadow effects
✅ **Admin Only** - Secured with JWT authentication

---

## 🚀 Next Steps

1. **Run the SQL script** in Railway MySQL console
2. **Refresh your dev server** (should auto-reload)
3. **Login as admin** and navigate to `/admin/banners`
4. **Create your first custom banner**!
5. **Visit homepage** to see it live

---

## 🐛 Troubleshooting

**Banners not showing on homepage?**
- Check if banners are marked as "Active" (✅)
- Verify Railway backend is running
- Check browser console for API errors

**Can't access banner management?**
- Make sure you're logged in as admin
- Check if "Banners" link appears in navigation
- Verify admin user has `role='admin'` in database

**Backend errors?**
- Ensure `sale_banners` table exists in MySQL
- Check Railway logs for errors
- Verify all environment variables are set

---

## 📝 Database Schema

```sql
CREATE TABLE sale_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  discount_text VARCHAR(100),
  description TEXT,
  image_url TEXT,
  background_color VARCHAR(50) DEFAULT 'from-red-500 to-orange-500',
  button_text VARCHAR(100) DEFAULT 'Shop Now',
  button_link VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

**Need help?** Check the browser console (F12) for detailed API logs.
