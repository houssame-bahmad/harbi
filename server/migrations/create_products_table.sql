-- Products table for e-commerce functionality
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
  INDEX idx_created_at (created_at)
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
('Toothpaste Whitening', 'Advanced whitening toothpaste', 7.99, 'Personal Care', 'https://images.unsplash.com/photo-1622597467836-f3c7ca2cd3c5?w=400', 150, TRUE);
