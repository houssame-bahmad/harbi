-- Sale Banners Table for Homepage Promotions
-- ==============================================

CREATE TABLE IF NOT EXISTS sale_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  discount_text VARCHAR(100),
  description TEXT,
  image_url TEXT,
  background_color VARCHAR(50) DEFAULT 'from-red-500 to-orange-500',
  button_text VARCHAR(100) DEFAULT 'Shop Now',
  button_link VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_active (is_active),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample sale banners
INSERT INTO sale_banners (title, subtitle, discount_text, description, background_color, button_text, display_order, is_active) VALUES
('MEGA SALE', 'Limited Time', '50% OFF', 'On selected skincare products', 'from-red-500 via-pink-500 to-orange-500', 'Shop Now', 1, TRUE),
('Vitamins', 'Health Boost', 'BUY 2 GET 1 FREE', 'All vitamin supplements', 'from-green-500 via-emerald-500 to-teal-500', 'View Deals', 2, TRUE),
('New Products', 'Just Arrived', 'UP TO 30% OFF', 'Latest arrivals', 'from-purple-600 via-blue-600 to-indigo-600', 'Discover', 3, TRUE)
ON DUPLICATE KEY UPDATE title=title;

SELECT 'Sale banners table created successfully!' as message;
