-- Add contact_info table for storing admin contact details
CREATE TABLE IF NOT EXISTS contact_info (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255),
  phone VARCHAR(50),
  linkedin VARCHAR(255),
  twitter VARCHAR(255),
  instagram VARCHAR(255),
  cvUrl VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default contact info
INSERT INTO contact_info (id, email, phone, linkedin, twitter, instagram, cvUrl)
VALUES (
  UUID(),
  'benmina01ahmed@gmail.com',
  '',
  '',
  '',
  '',
  ''
) ON DUPLICATE KEY UPDATE email=email;
