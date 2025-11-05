-- Fix User Roles in Railway MySQL
-- Run this in Railway MySQL console

-- First, modify the ENUM to include 'user' instead of 'customer'
ALTER TABLE users 
MODIFY COLUMN role ENUM('admin', 'editor', 'viewer', 'user', 'delivery') DEFAULT 'user';

-- Update existing customer users to 'user' role
UPDATE users SET role = 'user' WHERE role = 'customer';

-- Verify the changes
SELECT id, email, role, full_name FROM users;
