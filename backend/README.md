# Parapharmacie Backend API

Express.js + TypeScript + PostgreSQL backend for the Parapharmacie Store.

## 🚀 Quick Start

### Development
```powershell
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database URL

# Run development server
npm run dev
```

### Production
```powershell
# Build
npm run build

# Start
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.ts          # JWT authentication
│   ├── routes/
│   │   ├── auth.ts          # Login/register
│   │   ├── products.ts      # Product CRUD
│   │   ├── orders.ts        # Order management
│   │   └── users.ts         # User management
│   ├── scripts/
│   │   └── migrate.ts       # Database migrations
│   └── server.ts            # Express app
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get product by ID (public)
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders/my-orders` - Get user's orders (authenticated)
- `GET /api/orders/all` - Get all orders (admin only)
- `GET /api/orders/delivery` - Get delivery orders (delivery/admin)
- `POST /api/orders` - Create order (authenticated)
- `PATCH /api/orders/:id/status` - Update order status (authenticated)
- `PATCH /api/orders/:id/payment` - Update payment status (authenticated)
- `PATCH /api/orders/:id/assign` - Assign delivery person (admin only)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/delivery-persons` - Get delivery persons (admin only)
- `PATCH /api/users/:id/role` - Update user role (admin only)

## 🔒 Environment Variables

Create a `.env` file:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-domain.com
JWT_EXPIRES_IN=7d
```

## 🗄️ Database

Uses PostgreSQL with the schema defined in `/db/schema.postgres.sql`.

### Run Migrations
```powershell
npm run migrate
```

## 🔐 Security Features

- **bcrypt** - Password hashing (10 salt rounds)
- **JWT** - Token-based authentication
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - 100 requests per 15 minutes

## 📦 Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **dotenv** - Environment variables

## 🚢 Deployment

See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed deployment instructions.

**Quick Railway Deployment:**
```powershell
railway login
railway init
railway up
```

## 🧪 Testing

```powershell
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 📝 License

MIT
