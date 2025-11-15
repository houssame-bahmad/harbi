-- ============================================
-- PARAPHARMACIE CART TABLES MIGRATION
-- Run this SQL in phpMyAdmin to create cart tables
-- Database: u894306996_harbi
-- ============================================

-- IMPORTANT: Select your database first
USE u894306996_harbi;

-- Step 1: Create cart_items table (without foreign keys first)
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Create indexes for faster queries
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);

-- Step 3: Add foreign keys (only if users and products tables exist)
-- Uncomment these lines after verifying your table structure:
-- ALTER TABLE cart_items ADD CONSTRAINT fk_cart_user 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ALTER TABLE cart_items ADD CONSTRAINT fk_cart_product 
--   FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- ============================================
-- DONE! Cart tables created successfully.
-- Verify by checking if cart_items appears in the tables list on the left
-- ============================================
