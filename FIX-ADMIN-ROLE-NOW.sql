-- QUICK FIX: Update Admin User Role
-- Run this in Railway MySQL console NOW

-- Fix the admin user role
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@exemple.com';

-- Verify it worked
SELECT id, email, role, full_name FROM users WHERE email = 'admin@exemple.com';
