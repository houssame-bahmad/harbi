```markdown
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Parapharmacie Store - Professional E-Commerce Platform

A complete parapharmacie (health & beauty products) e-commerce application with password authentication, delivery management, and payment tracking.

## Features

- **Password-Based Authentication** - Secure login/registration for all users
- **Multi-Role System** - USER, DELIVERY, and ADMIN roles with different permissions
- **Delivery Tracking** - Dedicated dashboard for delivery personnel
- **Payment Management** - Track payment status (Pending/Paid/Refunded)
- **Order Lifecycle** - Complete workflow from pending to delivered
- **Product Details** - Ingredients, specs, reviews for each product
- **Admin Dashboard** - Assign deliveries, manage orders, view customers
- **Professional UI** - Google Fonts, hero section, search, category filters

## Test Accounts

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

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Run the development server:**
   ```powershell
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3001
   ```

## Database Setup (Production)

The project includes PostgreSQL schema and seed files in the `db/` folder:

- `db/schema.postgres.sql` — Complete schema with users, products, orders, categories
- `db/seed.postgres.sql` — Sample data with 3 users, 4 categories, and products

### Quick PostgreSQL Setup

1. **Create database:**
   ```powershell
   createdb parapharmacie_db
   ```

2. **Run schema:**
   ```powershell
   psql -d parapharmacie_db -f db/schema.postgres.sql
   ```

3. **Seed data:**
   ```powershell
   psql -d parapharmacie_db -f db/seed.postgres.sql
   ```

4. **Configure environment:**
   - Set `DATABASE_URL` in your deployment environment
   - Replace mockApi calls with actual database queries
   - Recommend using `pg` or `typeorm` for Node.js

### Database Features

- **User Roles**: USER, DELIVERY, ADMIN enums
- **Order Status**: PENDING → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED → CANCELLED
- **Payment Status**: PENDING → PAID or REFUNDED
- **Password Hashing**: Includes password_hash column (use bcrypt in production)
- **Delivery Assignment**: Orders can be assigned to delivery persons

## User Roles & Permissions

### USER (Customer)
- Browse and search products
- Add to cart and checkout
- View order history with payment status
- Cannot access admin or delivery features

### DELIVERY (Delivery Person)
- Access delivery dashboard at `/delivery`
- View assigned orders with customer details
- Mark orders as delivered
- Update payment status (cash collection/refund)

### ADMIN
- Manage all orders and users
- Assign orders to delivery persons
- Update order and payment status
- Create/edit/delete products
- View customer details
- **Cannot place orders** (admin is for management only)

## Order & Payment Workflow

### Order Lifecycle
1. **PENDING** - Customer places order
2. **CONFIRMED** - Admin confirms order
3. **OUT_FOR_DELIVERY** - Admin assigns to delivery person
4. **DELIVERED** - Delivery person marks as complete
5. **CANCELLED** - Admin cancels if needed

### Payment Tracking
- **PENDING** - Initial state
- **PAID** - Payment collected (by delivery or online)
- **REFUNDED** - Returned to customer

## UI & Design

### Professional Layout
- **Typography**: Inter (body), Poppins (headings)
- **Color Scheme**: Medical blue, health green, clean neutrals
- **Components**: Custom cards, modals, buttons with loading states
- **Responsive**: Mobile-first design with Tailwind CSS

### Key Pages
- `/` - Homepage with hero, search, category filters
- `/login` - Password-protected login
- `/register` - User registration with password
- `/cart` - Shopping cart with checkout button
- `/orders` - Customer order history
- `/delivery` - Delivery person dashboard
- `/admin` - Admin order & user management
- `/products` - Product management (admin only)

## Technology Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 19.2.0 + TypeScript |
| Routing | React Router DOM 7.9.5 |
| Styling | Tailwind CSS + Custom CSS |
| State | React Context API |
| Build | Vite 6.2.0 |
| Database | PostgreSQL (production) |
| Mock API | localStorage (development) |

## Security Notes

### Current Implementation (Demo)
- Password hashing uses `btoa` (base64 - **DEMO ONLY**)
- Session stored in localStorage
- Client-side validation

### Production Recommendations
1. **Replace `btoa` with `bcrypt`** for password hashing
2. **Use HTTP-only cookies** for session management
3. **Implement JWT** with refresh tokens
4. **Add rate limiting** to prevent abuse
5. **Use HTTPS** in production
6. **Server-side validation** for all inputs
7. **Parameterized queries** to prevent SQL injection

## Project Structure

```
parapharmacie-store/
├── backend/             # Express.js API (NEW - for production)
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── middleware/ # Authentication
│   │   └── server.ts   # Express server
│   └── package.json    # Backend dependencies
├── App.tsx              # Main app with routing & components
├── types.ts             # TypeScript interfaces & enums
├── services/
│   ├── mockApi.ts      # Mock backend (localStorage - current)
│   └── api.ts          # HTTP client (NEW - for production)
├── components/
│   └── ui.tsx          # Reusable UI components
├── db/
│   ├── schema.postgres.sql   # Database schema
│   └── seed.postgres.sql     # Sample data
├── index.css           # Global styles
├── index.html          # HTML template
├── vercel.json         # Vercel deployment config
├── netlify.toml        # Netlify deployment config
└── DEPLOYMENT.md       # Complete deployment guide
```

## Documentation

- **DEPLOYMENT.md** - Complete deployment guide (Railway + Vercel/Netlify)
- **DEPLOYMENT-CHECKLIST.md** - Step-by-step deployment checklist
- **QUICKSTART.md** - Quick start guide for development
- **README-DEPLOYMENT.md** - Deployment setup summary
- **FEATURES.md** - Comprehensive feature documentation
- **backend/README.md** - Backend API documentation
- **README.md** - This file (setup & overview)
- **TypeScript types** - See `types.ts` for all interfaces

## Deployment

### Production Deployment (NEW!)

This project is now ready for production deployment:

**Backend:** Deploy to Railway (Express.js + PostgreSQL)
**Frontend:** Deploy to Vercel or Netlify (React + Vite)

### Quick Deploy:
1. Read **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** for step-by-step guide
2. Deploy backend to **Railway** (~10 minutes)
3. Deploy frontend to **Vercel** or **Netlify** (~5 minutes)
4. Total time: **~30 minutes** to go live! 🚀

### Deployment Guides:
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment instructions
- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - Interactive checklist
- **[RAILWAY-DEPLOY.md](./RAILWAY-DEPLOY.md)** - Railway backend deployment
- **[HOSTINGER-DEPLOY.md](./HOSTINGER-DEPLOY.md)** - Hostinger frontend deployment
- **[QUICKSTART.md](./QUICKSTART.md)** - Local development setup
- **[README-DEPLOYMENT.md](./README-DEPLOYMENT.md)** - Deployment setup summary

### Technology Stack (Production):

**Backend:**
- Express.js 4.18
- PostgreSQL (Railway)
- JWT + bcrypt authentication
- TypeScript
- Security: Helmet, CORS, Rate Limiting

**Frontend:**
- React 19.2.0 + TypeScript
- Vite 6.2.0
- Hostinger / Vercel / Netlify hosting options
- Environment-based API configuration

**Cost:** $0-5/month (Railway $5/month + Hostinger existing account)

### Development vs Production:

**Current Setup (Development):**
- Uses `mockApi.ts` with localStorage
- No backend server needed
- Perfect for local testing
- Run: `npm run dev`

**Production Setup (NEW):**
- Real Express.js backend API
- PostgreSQL database
- JWT authentication
- Production security
- Deploy: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## Deployment

### Deploy to Production

1. **Set up PostgreSQL database** (Railway, Render, Heroku, etc.)
2. **Run schema and seed files** against production DB
3. **Replace mockApi** with real backend API
4. **Update password hashing** to use bcrypt
5. **Configure environment variables** (DATABASE_URL, etc.)
6. **Build for production:**
   ```powershell
   npm run build
   ```
7. **Deploy static files** to hosting (Vercel, Netlify, etc.)

### Environment Variables (Production)
```env
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
```

## 🐛 Development

### Run TypeScript Check
```powershell
npx tsc --noEmit
```

### Run Dev Server
```powershell
npm run dev
```

### Build for Production
```powershell
npm run build
```

## 📞 Support

For questions or issues:
1. Check **FEATURES.md** for detailed documentation
2. Review database schema in `db/schema.postgres.sql`
3. Inspect mock API in `services/mockApi.ts`

## 📄 License

MIT License - feel free to use this project for commercial or personal purposes.

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**Built with**: React + TypeScript + Vite + PostgreSQL
```
