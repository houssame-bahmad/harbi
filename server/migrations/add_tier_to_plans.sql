-- Add tier and description columns to plans table
ALTER TABLE plans 
ADD COLUMN tier VARCHAR(20) DEFAULT 'basic' AFTER name,
ADD COLUMN description TEXT AFTER duration;

-- Update existing plans to set tier based on name (if any exist)
UPDATE plans SET tier = 'basic' WHERE LOWER(name) LIKE '%basic%';
UPDATE plans SET tier = 'standard' WHERE LOWER(name) LIKE '%standard%';
UPDATE plans SET tier = 'vip' WHERE LOWER(name) LIKE '%vip%' OR LOWER(name) LIKE '%premium%';
