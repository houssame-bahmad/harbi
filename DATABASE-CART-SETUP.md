# Database Cart Implementation - Complete Guide

## ✅ What Was Changed

The shopping cart system has been **completely migrated from localStorage to MySQL database** for proper data persistence and multi-device synchronization.

### Files Modified:

1. **App.tsx** (CartProvider rewritten)
   - Removed all localStorage operations
   - Now uses API calls to fetch/update cart
   - Cart loads automatically when user logs in
   - Cart persists across devices and sessions

2. **services/api.ts** (Added cart API methods)
   - `getCart()` - Fetch user's cart
   - `addToCart(productId, quantity)` - Add item
   - `updateCartItem(cartItemId, quantity)` - Update quantity
   - `removeCartItem(cartItemId)` - Remove item
   - `clearCart()` - Clear all items

3. **server/routes/cart.js** (NEW FILE)
   - `GET /api/cart` - Get user's cart items with product details
   - `POST /api/cart/add` - Add item to cart
   - `PUT /api/cart/update/:cartItemId` - Update quantity
   - `DELETE /api/cart/remove/:cartItemId` - Remove item
   - `DELETE /api/cart/clear` - Clear cart

4. **server/server.js**
   - Registered `/api/cart` routes

5. **server/migrations/add_cart_tables.sql** (NEW FILE)
   - Creates `cart_items` table
   - Foreign keys to `users` and `products`
   - Unique constraint: one product per user

---

## 🗄️ Database Setup (CRITICAL - MUST RUN)

### Option 1: Using Railway CLI (Recommended)

If you have Railway CLI installed:

```bash
cd server
railway run node migrations/run-cart-migration.js
```

### Option 2: Using phpMyAdmin (Easy)

1. Go to your Hostinger phpMyAdmin: https://hpanel.hostinger.com
2. Select database: `u894306996_benmina_local`
3. Click "SQL" tab
4. Copy and paste this SQL:

```sql
-- Cart items table for storing user shopping carts
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Index for faster cart retrieval
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);
```

5. Click "Go" to execute

### Option 3: Using MySQL Command Line

```bash
mysql -h 208.77.244.31 -u u894306996_benmina_root -p u894306996_benmina_local < server/migrations/add_cart_tables.sql
```

---

## 🧪 How to Test

### 1. Test Backend API Directly

Using curl or Postman:

```bash
# Login first to get token
curl -X POST https://web-production-5b48e.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}'

# Get cart (replace YOUR_TOKEN)
curl -X GET https://web-production-5b48e.up.railway.app/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add to cart
curl -X POST https://web-production-5b48e.up.railway.app/api/cart/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### 2. Test Frontend

1. Open your website: https://main--parapharmacie-store.netlify.app
2. **Login** with a user account (cart requires authentication)
3. Add products to cart
4. Refresh page - cart should persist
5. Login from another device/browser - cart should sync
6. Logout and login with different user - each user has separate cart

### 3. Verify Database

Check phpMyAdmin to see cart_items table populated:

```sql
SELECT 
  c.id,
  u.email,
  p.name as product_name,
  c.quantity,
  c.created_at
FROM cart_items c
JOIN users u ON c.user_id = u.id
JOIN products p ON c.product_id = p.id
ORDER BY c.created_at DESC;
```

---

## 🔄 Migration from localStorage

**Automatic Migration:**
Users' old localStorage carts will be **lost** when they first use the new system. This is intentional because:
- Cart data was user-specific with `cart_user_${userId}` keys
- Most carts are temporary shopping sessions
- Database cart is more reliable

**If you need to preserve carts:**
Add this code to CartProvider temporarily:

```typescript
useEffect(() => {
  const migrateLocalStorageCart = async () => {
    if (!user) return;
    
    const oldCartKey = `cart_user_${user.id}`;
    const oldCart = localStorage.getItem(oldCartKey);
    
    if (oldCart) {
      const items = JSON.parse(oldCart);
      for (const item of items) {
        await api.addToCart(item.id, item.quantity);
      }
      localStorage.removeItem(oldCartKey);
    }
  };
  
  migrateLocalStorageCart();
}, [user?.id]);
```

---

## ⚠️ Important Notes

### Guest Users (Not Logged In)
- **Cannot add to cart** - alert shown: "Veuillez vous connecter pour ajouter des articles au panier"
- Must login/register first
- This prevents anonymous cart data

### Stock Validation
- Backend checks `stock_quantity` before adding items
- Returns error if insufficient stock
- Prevents overselling

### Cart Synchronization
- Cart syncs across all devices for same user
- Real-time updates when quantity changes
- Persists across sessions

### Performance
- Database indexed on `user_id` and `product_id`
- Joins with products table for full details
- Cascading deletes: removing user/product removes cart items

---

## 🚀 Deployment Checklist

✅ **Completed:**
- [x] Created `cart_items` table schema
- [x] Built `/api/cart` backend routes
- [x] Updated frontend CartProvider
- [x] Added API client methods
- [x] Registered routes in server.js
- [x] Committed to GitHub (commits: a6f9c14, b259b13)
- [x] Pushed to Railway (auto-deploy)

⏳ **Pending:**
- [ ] Run SQL migration on production database
- [ ] Test cart functionality on live site
- [ ] Verify multi-device synchronization

---

## 📊 Database Schema

```sql
cart_items
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── user_id (INT, FOREIGN KEY → users.id)
├── product_id (INT, FOREIGN KEY → products.id)
├── quantity (INT, DEFAULT 1)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── UNIQUE(user_id, product_id)
```

**Relationships:**
- One user can have many cart items
- One product can be in many users' carts
- Each user can only have ONE entry per product (quantity increments)
- Deleting user → deletes their cart items (CASCADE)
- Deleting product → removes from all carts (CASCADE)

---

## 🐛 Troubleshooting

### "Failed to load cart" Error
- Check if migration ran successfully
- Verify `cart_items` table exists in database
- Check browser console for API errors

### "Failed to add to cart" Error
- Ensure user is logged in
- Check product has sufficient stock
- Verify product exists in database

### Cart not syncing across devices
- Clear browser cache
- Check if both devices are logged in as same user
- Verify API endpoint is accessible

### 502 Bad Gateway
- Railway backend may be restarting
- Check Railway logs: `railway logs`
- Wait 30 seconds and retry

---

## 📝 API Reference

### GET /api/cart
Returns user's cart with full product details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "cart_item_id": 1,
    "id": 5,
    "name": "Product Name",
    "price": 299.99,
    "imageUrl": "https://...",
    "description": "...",
    "stockQuantity": 50,
    "quantity": 2
  }
]
```

### POST /api/cart/add
Add item to cart (or increment if exists).

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
  "productId": 5,
  "quantity": 2
}
```

**Response:**
```json
{
  "message": "Item added to cart",
  "cart": [...]
}
```

### PUT /api/cart/update/:cartItemId
Update quantity of cart item.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Body:**
```json
{
  "quantity": 5
}
```

### DELETE /api/cart/remove/:cartItemId
Remove item from cart.

**Headers:** `Authorization: Bearer <token>`

### DELETE /api/cart/clear
Clear entire cart.

**Headers:** `Authorization: Bearer <token>`

---

## ✨ Benefits of Database Cart

1. **Persistence:** Cart survives browser clears, incognito mode, etc.
2. **Multi-device:** Access cart from phone, tablet, desktop
3. **Analytics:** Track cart abandonment, popular items
4. **Security:** Server-side validation prevents tampering
5. **Scalability:** Handles thousands of users
6. **Recovery:** Cart saved even if user doesn't checkout

---

## 🔗 Related Files

- Backend Routes: `server/routes/cart.js`
- Frontend Provider: `App.tsx` (lines 108-228)
- API Client: `services/api.ts` (lines 288-318)
- Database Config: `server/config/database.js`
- Migration: `server/migrations/add_cart_tables.sql`

---

Last Updated: $(date)
