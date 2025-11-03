# Parapharmacie Store - Features Documentation

## Overview
A professional parapharmacie (health & beauty products) e-commerce application with complete order management, delivery tracking, and payment processing.

## Authentication System

### Password-Based Login
- **Secure Authentication**: All users must provide email and password to login
- **Password Hashing**: Passwords are hashed using btoa (demo - use bcrypt in production)
- **Session Management**: User sessions persist via localStorage

### Test Accounts
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

## User Roles

### 1. USER (Customer)
**Capabilities:**
- Browse products and view detailed information
- Add products to cart
- Place orders
- View order history with payment status
- Cannot access admin or delivery features

**Restrictions:**
- Must be logged in to checkout

### 2. DELIVERY (Delivery Person)
**Capabilities:**
- Access dedicated delivery dashboard at `/delivery`
- View all orders assigned to them
- See complete customer details (name, phone, email, address)
- Mark orders as "Delivered"
- Update payment status (Paid/Refunded)
- Track delivery progress in real-time

**Dashboard Features:**
- Order listing with status badges
- Customer contact information
- Delivery address display
- Payment status tracking
- One-click delivery confirmation
- Payment collection/refund marking

### 3. ADMIN
**Capabilities:**
- Full order management
- User management (view all users, change roles)
- Product management (create, edit, delete products)
- Assign orders to delivery persons
- Update order status
- Update payment status
- View customer details for all orders
- Access to admin dashboard and host page

**Restrictions:**
- Cannot place orders as a customer (admin is for management only)

## Order Management

### Order Lifecycle
```
1. PENDING      → Order placed by customer
2. CONFIRMED    → Admin confirms the order
3. OUT_FOR_DELIVERY → Admin assigns to delivery person
4. DELIVERED    → Delivery person marks as delivered
5. CANCELLED    → Order cancelled by admin
```

### Payment Lifecycle
```
1. PENDING   → Initial state when order is placed
2. PAID      → Payment received (cash/online)
3. REFUNDED  → Payment returned to customer
```

## Delivery Workflow

### Step 1: Admin Assigns Order
- Admin views all pending/confirmed orders
- Selects a delivery person from dropdown
- Order status automatically changes to "OUT_FOR_DELIVERY"
- Delivery person sees order in their dashboard

### Step 2: Delivery Person Delivers
- Logs in and views assigned deliveries
- Sees customer contact info and address
- Delivers the order
- Marks as "Delivered" in dashboard
- Updates payment status based on collection

### Step 3: Payment Tracking
- Initially PENDING when order placed
- Delivery person marks as PAID (cash collected)
- Or marks as REFUNDED (if returning order)
- Admin can also update payment status

## Product Features

### Product Details Modal
Each product shows:
- **Basic Info**: Name, price, description, category
- **Ingredients**: Complete ingredient list
- **Specifications**: Size, skin type, concentration, etc.
- **Reviews**: User ratings and comments
- **Stock Status**: Real-time availability
- **Add to Cart**: Instant cart addition

### Search & Filter
- **Search Bar**: Search by product name, category, or ingredient
- **Category Filter**: Filter by Skincare, Vitamins, First Aid, etc.
- **Hero Section**: Professional landing with call-to-action

## Admin Features

### Order Management Table
Columns:
- Order ID
- Date
- Customer (with name and email)
- Total Amount
- Status (dropdown to update)
- Payment Status (badge + dropdown)
- Delivery Person (assign or view assigned)
- Actions (view customer details)

### Real-time Updates
- Auto-refreshes every 5 seconds
- Live order status changes
- Immediate delivery assignment updates

### User Details Modal
- Full name, email, phone
- User role
- Member since date
- Accessible from order management

## Professional UI/UX

### Typography
- **Primary Font**: Inter (clean, modern)
- **Headings**: Poppins (bold, professional)

### Color Scheme
- **Primary**: Medical blue (#3b82f6)
- **Secondary**: Health green (#10b981)
- **Neutral**: Dark gray (#1f2937)

### Components
- Custom Card components with hover effects
- Product cards with shadow and zoom animation
- Modal dialogs for details
- Loading states for async operations
- Responsive navbar with search
- Professional footer

## Database Schema

### PostgreSQL Tables

#### users
```sql
- id (SERIAL PRIMARY KEY)
- role (ENUM: USER, DELIVERY, ADMIN)
- email (TEXT UNIQUE NOT NULL)
- full_name (TEXT NOT NULL)
- phone_number (TEXT)
- password_hash (TEXT NOT NULL)
- created_at (TIMESTAMP)
```

#### orders
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER REFERENCES users)
- order_date (TIMESTAMP)
- total_amount (NUMERIC)
- delivery_address (TEXT)
- payment_method (TEXT)
- status (ENUM: PENDING, CONFIRMED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
- payment_status (ENUM: PENDING, PAID, REFUNDED)
- delivery_person_id (INTEGER REFERENCES users)
```

#### products
```sql
- id (SERIAL PRIMARY KEY)
- category_id (INTEGER REFERENCES categories)
- name, description, price
- stock_quantity
- image_url
- ingredients (JSONB)
- specs (JSONB)
- reviews (JSONB)
```

## 🚀 Deployment

### Database Setup
```bash
# Create database
psql -U postgres -c "CREATE DATABASE parapharmacie_db;"

# Run schema
psql -d parapharmacie_db -f db/schema.postgres.sql

# Seed initial data
psql -d parapharmacie_db -f db/seed.postgres.sql
```

### Environment Configuration
Update database connection in your backend (when migrating from mock API):
```typescript
// Replace mockApi calls with actual Postgres queries
// Use pg or typeorm for database connection
```

## 🔧 Technical Stack

- **Frontend**: React 19.2.0 + TypeScript
- **Routing**: React Router DOM 7.9.5 (BrowserRouter for clean URLs)
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React Context API
- **Build Tool**: Vite 6.2.0
- **Database**: PostgreSQL (production ready)
- **Mock Backend**: localStorage (development)

## 📱 Navigation Structure

```
/ (Home)
├── /login
├── /register
├── /cart
├── /product/:id
├── /checkout (USER only)
├── /orders (USER + ADMIN)
├── /delivery (DELIVERY only)
│   └── Delivery Dashboard
├── /host (ADMIN only)
│   └── Product Management
└── /admin (ADMIN only)
    ├── Order Management
    └── User Management
```

## 🔒 Security Notes

### Current Implementation (Demo)
- Password hashing uses `btoa` (base64 encoding)
- Session stored in localStorage
- Mock API with client-side validation

### Production Recommendations
1. **Password Security**:
   - Replace `btoa` with `bcrypt` (min 10 salt rounds)
   - Hash on server-side, never send plain passwords
   
2. **Session Management**:
   - Use HTTP-only cookies
   - Implement JWT with refresh tokens
   - Add CSRF protection

3. **API Security**:
   - Add rate limiting
   - Implement proper CORS policies
   - Use HTTPS in production
   - Validate all inputs server-side

4. **Database Security**:
   - Use parameterized queries (prevent SQL injection)
   - Set up proper user roles and permissions
   - Enable SSL for database connections

## 🎯 Key Features Summary

✅ Password-protected login and registration  
✅ Three user roles (USER, DELIVERY, ADMIN)  
✅ Complete order lifecycle management  
✅ Delivery person workflow with customer details  
✅ Payment status tracking (PENDING/PAID/REFUNDED)  
✅ Admin can assign deliveries and manage payments  
✅ Real-time order updates in admin dashboard  
✅ Professional UI with search, filters, and product details  
✅ PostgreSQL-ready schema and seed files  
✅ Clean URL routing (no hash fragments)  
✅ Responsive design for mobile and desktop  

## 📞 Support & Maintenance

### User Credentials Reset
To reset user passwords in production:
```sql
-- Hash new password with bcrypt first, then:
UPDATE users SET password_hash = 'new_hash' WHERE email = 'user@example.com';
```

### Adding New Delivery Persons
```sql
INSERT INTO users (role, email, full_name, phone_number, password_hash, created_at)
VALUES ('DELIVERY', 'newdelivery@example.com', 'New Delivery Person', '555-555-5555', 'hashed_password', now());
```

### Monitoring Orders
All orders are tracked with:
- Creation date/time
- Status changes
- Payment status changes
- Delivery person assignments
- Customer information

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**License**: MIT
