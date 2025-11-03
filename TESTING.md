# Testing Guide - Parapharmacie Store

## Quick Test Checklist

### 🔐 Test Password Authentication

1. **Test Login Page**
   - Navigate to http://localhost:3001/login
   - Try logging in with admin credentials:
     - Email: `admin@example.com`
     - Password: `admin123`
   - Should redirect to homepage with "Hello, Admin" in navbar

2. **Test Registration**
   - Navigate to http://localhost:3001/register
   - Fill in:
     - Full Name: `Test User`
     - Email: `test@example.com`
     - Phone: `555-555-1234`
     - Password: `test123`
   - Should create account and log in automatically

3. **Test Wrong Password**
   - Try logging in with correct email but wrong password
   - Should show "Invalid email or password" error

### 👤 Test USER Role

1. **Login as User**
   - Email: `user@example.com`
   - Password: `user123`
   - Should see "My Orders" link in navbar (not "Admin" or "My Deliveries")

2. **Test Shopping Flow**
   - Browse products on homepage
   - Click "Details" on any product to see modal with:
     - Ingredients list
     - Specifications (size, type, etc.)
     - Reviews with ratings
   - Add product to cart
   - Go to cart page
   - Click "Proceed to Checkout"
   - Fill in shipping address
   - Place order
   - Check "My Orders" to see the new order with PENDING status

3. **Test Payment Status Display**
   - In "My Orders" page, verify you can see:
     - Order status badge (PENDING, CONFIRMED, etc.)
     - Payment status badge (PENDING, PAID, REFUNDED)
     - Total amount

### 🚚 Test DELIVERY Role

1. **Login as Delivery Person**
   - Logout current user
   - Login with:
     - Email: `delivery@example.com`
     - Password: `delivery123`
   - Should see "My Deliveries" link in navbar

2. **View Delivery Dashboard**
   - Click "My Deliveries" or navigate to `/delivery`
   - Initially should show "No deliveries assigned to you yet"

3. **Test Delivery Workflow** (requires admin to assign first)
   - Have admin assign an order to delivery person (see admin test below)
   - Refresh delivery dashboard
   - Should see assigned order with:
     - Customer name, phone, email
     - Delivery address
     - Order items and total
     - Status badges (order status + payment status)
   - Click "Mark as Delivered" button
   - Order status should change to DELIVERED
   - Click "Mark Paid" to update payment status
   - Payment badge should change to PAID

### 🛡️ Test ADMIN Role

1. **Login as Admin**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Should see "Admin" and "Manage Products" links in navbar

2. **Test Admin Dashboard**
   - Navigate to `/admin`
   - Should see:
     - Order Management table with all orders
     - User Management section below
   - Table should auto-refresh every 5 seconds

3. **Test Order Assignment**
   - Find an order with status CONFIRMED or PENDING
   - In "Delivery Person" column, click dropdown
   - Select "Delivery Person" from list
   - Order status should automatically change to OUT_FOR_DELIVERY
   - Delivery person name should appear in the column

4. **Test Payment Status Management**
   - Find any order
   - In "Payment" column, see current status badge
   - Use dropdown to change payment status
   - Select PAID or REFUNDED
   - Badge should update immediately

5. **Test Order Status Changes**
   - In "Status" column, change order status using dropdown
   - Try: PENDING → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED
   - Changes should reflect immediately

6. **Test Customer Details**
   - Click "View User" button in Actions column
   - Modal should show:
     - Full name
     - Email
     - Phone number
     - Role
     - Member since date

7. **Test Admin Cannot Order**
   - Add product to cart
   - Go to cart page
   - Should NOT see "Proceed to Checkout" button
   - Should see message: "Admins cannot place orders"

8. **Test Product Management**
   - Navigate to `/products`
   - Click "Add New Product"
   - Fill in product details:
     - Name, description, price, stock
     - Category selection
     - Image upload or URL
     - Ingredients (optional)
     - Specifications (optional)
   - Click "Save Product"
   - Product should appear in list
   - Test Edit and Delete functionality

### 🔄 Test Complete Workflow

**Full Order Lifecycle Test:**

1. **Customer Places Order** (as USER)
   - Login as user@example.com
   - Add product to cart
   - Checkout with address
   - Order created with status: PENDING, payment: PENDING

2. **Admin Confirms Order** (as ADMIN)
   - Login as admin@example.com
   - Go to /admin
   - Find the new order
   - Change status to CONFIRMED

3. **Admin Assigns Delivery** (as ADMIN)
   - On same order, select delivery person from dropdown
   - Status auto-changes to OUT_FOR_DELIVERY

4. **Delivery Person Delivers** (as DELIVERY)
   - Login as delivery@example.com
   - Go to /delivery
   - See the assigned order
   - Click "Mark as Delivered"
   - Click "Mark Paid" (if cash collected)
   - Status: DELIVERED, Payment: PAID

5. **Customer Views Status** (as USER)
   - Login as user@example.com
   - Go to /orders
   - See order with DELIVERED status and PAID payment

### 🎨 Test UI Features

1. **Search Functionality**
   - Use search bar in navbar
   - Search for "vitamin", "cream", "serum"
   - Results should filter products

2. **Category Filter**
   - On homepage, click category buttons:
     - All Products
     - Skincare
     - Vitamins & Supplements
     - First Aid
     - Personal Care
   - Products should filter accordingly

3. **Product Details Modal**
   - Click "Details" on any product
   - Verify modal shows:
     - Category name
     - Ingredients list
     - Specifications table
     - Reviews with stars
   - Close modal with X or outside click

4. **Responsive Design**
   - Resize browser window
   - Test mobile view (< 640px)
   - Verify navbar collapses properly
   - Product grid adjusts to mobile

5. **Empty States**
   - Empty cart: Should show styled card with message
   - No orders: Should show "You have not placed any orders yet"
   - No deliveries: Should show "No deliveries assigned"

### 🔒 Test Authentication & Authorization

1. **Protected Routes**
   - Try accessing `/checkout` without login → redirect to login
   - Try accessing `/admin` as USER → redirect to home
   - Try accessing `/delivery` as USER → redirect to home
   - Try accessing `/delivery` as ADMIN → redirect to home

2. **Logout**
   - Click logout button
   - Should redirect to homepage
   - Navbar should show "Login" button
   - Try accessing protected route → redirect to login

### 📊 Test Data Persistence

1. **Cart Persistence**
   - Add items to cart
   - Refresh page
   - Cart items should remain

2. **Login Persistence**
   - Login
   - Refresh page
   - Should remain logged in

3. **Order Persistence**
   - Place order
   - Refresh page
   - Order should appear in history

### 🐛 Test Error Handling

1. **Invalid Login**
   - Try wrong email
   - Try wrong password
   - Should show error message

2. **Duplicate Registration**
   - Try registering with existing email
   - Should show "This email may already be in use"

3. **Out of Stock**
   - Find product with stock_quantity = 0
   - "Add to Cart" should be disabled

## Browser Console Checks

Open DevTools (F12) and check:

1. **No Console Errors**
   - Should not see any red errors
   - TypeScript errors should be resolved

2. **Network Requests**
   - All requests should succeed (200 status)
   - Check response data is correct

3. **localStorage**
   - Check Application > Local Storage
   - Should see: `users`, `products`, `orders`, `categories`, `user`

## Performance Checks

1. **Page Load Speed**
   - Homepage should load < 1 second
   - No layout shift

2. **Smooth Interactions**
   - Modal open/close should be instant
   - Add to cart should update count immediately
   - No lag when typing in search

## Accessibility Checks

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space should trigger buttons

2. **Form Labels**
   - All inputs should have labels
   - Required fields marked

3. **Color Contrast**
   - Text should be readable
   - Buttons have clear visual states

## Known Limitations (Demo Mode)

- ✋ **Security**: btoa hashing is NOT production-ready (use bcrypt)
- ✋ **Storage**: localStorage clears on browser data wipe
- ✋ **Images**: Using placeholder images from picsum.photos
- ✋ **Real-time**: Admin auto-refresh is client-side polling, not WebSocket
- ✋ **Payment**: No actual payment gateway integration

## Next Steps for Production

1. Replace mockApi with real backend API
2. Implement bcrypt password hashing
3. Set up PostgreSQL database
4. Add payment gateway (Stripe, PayPal)
5. Implement email notifications
6. Add image upload for products
7. Set up CI/CD pipeline
8. Add monitoring and analytics

---

**Test Coverage**: Core features functional  
**Ready for**: Development demo, client presentation  
**Not ready for**: Production deployment (see security notes)
