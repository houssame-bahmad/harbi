-- PostgreSQL schema for Parapharmacie Store
-- Run: psql -d your_db -f db/schema.postgres.sql

BEGIN;

-- Enums
CREATE TYPE user_role AS ENUM ('USER','DELIVERY','ADMIN');
CREATE TYPE order_status AS ENUM ('PENDING','CONFIRMED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING','PAID','REFUNDED');

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'USER',
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  host_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ingredients JSONB,
  specs JSONB,
  reviews JSONB
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_amount NUMERIC(10,2) NOT NULL,
  delivery_address TEXT,
  payment_method TEXT,
  status order_status NOT NULL DEFAULT 'PENDING',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  delivery_person_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Order Items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL
);

COMMIT;
