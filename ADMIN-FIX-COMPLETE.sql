-- COMPLETE ADMIN FIX FOR RAILWAY DATABASE
-- Run this entire script in Railway MySQL Console
-- ==============================================

-- Step 1: Ensure role ENUM includes all needed roles
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'editor', 'viewer', 'user', 'delivery') DEFAULT 'user';

-- Step 2: Delete any existing admin to avoid conflicts
DELETE FROM users WHERE email = 'admin@exemple.com';

-- Step 3: Create fresh admin user
-- Email: admin@exemple.com
-- Password: admin123
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

-- Step 4: Verify the admin was created correctly
SELECT 
  id, 
  email, 
  role, 
  full_name as fullName,
  created_at as createdAt
FROM users 
WHERE email = 'admin@exemple.com';

-- Expected Output:
-- You should see ONE row with:
-- - email: admin@exemple.com
-- - role: admin
-- - fullName: Administrator

-- After running this script:
-- 1. Clear browser localStorage: localStorage.clear()
-- 2. Refresh the page
-- 3. Login with: admin@exemple.com / admin123
-- 4. You should see "Admin Panel" and "Products" links in navigation
