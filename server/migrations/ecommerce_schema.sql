-- E-Commerce Tables for Parapharmacie Store
-- =============================================

-- Update users table to support e-commerce roles
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'editor', 'viewer', 'customer', 'delivery') DEFAULT 'customer';

-- Add additional user fields for e-commerce
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  stock INT DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_created_at (created_at),
  INDEX idx_in_stock (in_stock)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  delivery_address TEXT NOT NULL,
  delivery_city VARCHAR(100),
  delivery_postal_code VARCHAR(20),
  delivery_person_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (delivery_person_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_delivery_person_id (delivery_person_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock, in_stock) VALUES
('Vitamin C Serum', 'Brightening facial serum with 20% Vitamin C', 29.99, 'Skincare', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400', 50, TRUE),
('Multivitamin Complex', 'Daily multivitamin with essential nutrients', 19.99, 'Vitamins', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', 100, TRUE),
('First Aid Kit', 'Complete first aid kit for home and travel', 39.99, 'First Aid', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400', 30, TRUE),
('Hand Sanitizer', 'Antibacterial hand sanitizer 500ml', 9.99, 'Personal Care', 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400', 200, TRUE),
('Face Moisturizer', 'Hydrating face cream for all skin types', 24.99, 'Skincare', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 75, TRUE),
('Omega-3 Fish Oil', 'Premium omega-3 supplement 1000mg', 34.99, 'Vitamins', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400', 60, TRUE),
('Digital Thermometer', 'Fast and accurate digital thermometer', 14.99, 'First Aid', 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400', 45, TRUE),
('Toothpaste Whitening', 'Advanced whitening toothpaste', 7.99, 'Personal Care', 'https://images.unsplash.com/photo-1622597467836-f3c7ca2cd3c5?w=400', 150, TRUE),
('Hyaluronic Acid Serum', 'Deep hydration serum', 26.99, 'Skincare', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', 40, TRUE),
('Vitamin D3', 'High potency vitamin D supplement', 15.99, 'Vitamins', 'https://images.unsplash.com/photo-1550572017-4ec3683533c6?w=400', 80, TRUE)
ON DUPLICATE KEY UPDATE name=name;

SELECT 'E-commerce schema created successfully!' as message;
