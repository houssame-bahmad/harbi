-- Quick Admin User Setup for Railway
-- Run this SQL in Railway MySQL console

-- Create admin user
-- Email: admin@exemple.com
-- Password: admin123
INSERT INTO users (id, email, password, role, full_name, created_at)
VALUES (
  UUID(),
  'admin@exemple.com',
  '$2a$10$0eAO7aEvnfijwr13vT3fkuOtxglNfkCpRvn5Uq6KnFeto2aeMUgde',
  'admin',
  'Administrator',
  NOW()
) ON DUPLICATE KEY UPDATE email=email;

-- Verify admin was created
SELECT id, email, role, full_name, created_at FROM users WHERE email = 'admin@exemple.com';
