-- Seed data for Parapharmacie Store (Postgres)
-- Run: psql -d your_db -f db/seed.postgres.sql
-- IMPORTANT: These are example password hashes using btoa encoding (DEMO ONLY)
-- In production, use bcrypt or similar secure hashing

BEGIN;

-- Users (admin + regular user + delivery person)
-- Passwords: admin123, user123, delivery123 (hashed with btoa for demo)
INSERT INTO users (id, role, email, full_name, phone_number, password_hash, created_at) VALUES
  (1, 'ADMIN', 'admin@example.com', 'Admin User', '111-111-1111', 'YWRtaW5AZXhhbXBsZS5jb206YWRtaW4xMjM=', now()),
  (2, 'USER',  'user@example.com', 'Regular User', '333-333-3333', 'dXNlckBleGFtcGxlLmNvbTp1c2VyMTIz', now()),
  (3, 'DELIVERY', 'delivery@example.com', 'Delivery Person', '555-555-5555', 'ZGVsaXZlcnlAZXhhbXBsZS5jb206ZGVsaXZlcnkxMjM=', now());

-- Categories
INSERT INTO categories (id, name) VALUES
  (1, 'Skincare'),
  (2, 'Vitamins & Supplements'),
  (3, 'First Aid'),
  (4, 'Personal Care');

-- Products (host_id = admin user 1)
INSERT INTO products (id, category_id, host_id, name, description, price, stock_quantity, image_url, is_active, ingredients, specs, reviews) VALUES
  (1, 1, 1, 'Hydrating Face Cream', 'A rich, nourishing cream for all skin types.', 24.99, 50, 'https://picsum.photos/id/1025/400/400', true,
    '[]'::jsonb || ('["Aqua","Glycerin","Shea Butter","Niacinamide"]')::jsonb,
    ('[{"key":"Size","value":"50ml"},{"key":"Skin Type","value":"All"}]')::jsonb,
    ('[{"id":1,"userName":"Sofia","rating":5,"comment":"Very hydrating, my skin feels soft."},{"id":2,"userName":"Marc","rating":4,"comment":"Nice texture and absorbs well."}]')::jsonb
  ),
  (2, 1, 1, 'Vitamin C Serum', 'Brightens and evens skin tone.', 35.50, 30, 'https://picsum.photos/id/106/400/400', true,
    ('["Ascorbic Acid","Hyaluronic Acid","Vitamin E"]')::jsonb,
    ('[{"key":"Size","value":"30ml"},{"key":"Concentration","value":"15% Vitamin C"}]')::jsonb,
    ('[{"id":3,"userName":"Lina","rating":5,"comment":"Noticeable brightening after 2 weeks."}]')::jsonb
  ),
  (3, 2, 1, 'Multivitamin Gummies', 'Daily essential vitamins for adults.', 19.99, 100, 'https://picsum.photos/id/292/400/400', true,
    ('["Vitamin A","Vitamin C","Vitamin D3","Zinc"]')::jsonb,
    ('[{"key":"Count","value":"60 gummies"},{"key":"Dosage","value":"2 gummies/day"}]')::jsonb,
    ('[{"id":4,"userName":"Ahmed","rating":4,"comment":"Tastes good and helps my energy."}]')::jsonb
  ),
  (4, 3, 1, 'Advanced Band-Aids', 'Waterproof and flexible for all minor cuts.', 7.25, 200, 'https://picsum.photos/id/31/400/400', false,
    NULL,
    ('[{"key":"Count","value":"20 pcs"},{"key":"Material","value":"Polyurethane"}]')::jsonb,
    NULL
  ),
  (5, 4, 1, 'Organic Toothpaste', 'Fluoride-free with natural mint flavor.', 9.99, 75, 'https://picsum.photos/id/219/400/400', true,
    ('["Aloe Vera","Baking Soda","Peppermint Oil"]')::jsonb,
    ('[{"key":"Size","value":"100ml"}]')::jsonb,
    ('[{"id":5,"userName":"Nora","rating":5,"comment":"Nice fresh taste and gentle."}]')::jsonb
  );

-- Reset sequences to max IDs
SELECT setval(pg_get_serial_sequence('users','id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('categories','id'), COALESCE(MAX(id), 1)) FROM categories;
SELECT setval(pg_get_serial_sequence('products','id'), COALESCE(MAX(id), 1)) FROM products;
SELECT setval(pg_get_serial_sequence('orders','id'), COALESCE(MAX(id), 1)) FROM orders;
SELECT setval(pg_get_serial_sequence('order_items','id'), COALESCE(MAX(id), 1)) FROM order_items;

COMMIT;
