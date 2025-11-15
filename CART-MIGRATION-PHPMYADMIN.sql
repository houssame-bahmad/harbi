-- ============================================
-- PARAPHARMACIE CART TABLES MIGRATION
-- Run this SQL in phpMyAdmin to create cart tables
-- Database: u894306996_benmina_local
-- ============================================

-- Step 1: Create cart_items table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Create indexes for faster queries
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);

-- Step 3: Verify table creation
SELECT 
  TABLE_NAME, 
  TABLE_ROWS, 
  CREATE_TIME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'u894306996_benmina_local' 
  AND TABLE_NAME = 'cart_items';

-- ============================================
-- DONE! Cart tables created successfully.
-- ============================================
