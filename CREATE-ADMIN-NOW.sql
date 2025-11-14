-- CREATE ADMIN USER NOW
-- Copy and paste this entire script into Railway MySQL console

-- First, make sure the role ENUM includes 'admin'
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'editor', 'viewer', 'user', 'delivery') DEFAULT 'user';

-- Delete any existing admin user (to avoid duplicates)
DELETE FROM users WHERE email = 'admin@exemple.com';

-- Create admin user with correct role
INSERT INTO users (id, email, password, role, full_name, phone, created_at)
VALUES (
  UUID(),
  'admin@exemple.com',
  '$2a$10$0eAO7aEvnfijwr13vT3fkuOtxglNfkCpRvn5Uq6KnFeto2aeMUgde',
  'admin',
  'Administrator',
  '',
  NOW()
);

-- Verify the admin user was created
SELECT id, email, role, full_name FROM users WHERE email = 'admin@exemple.com';

-- Expected result: You should see one row with role='admin'
