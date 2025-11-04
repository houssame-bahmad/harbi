-- Migration: Add base64 storage support to media_files table
-- Run this if media_files table already exists

-- Check if columns already exist and add them if not
ALTER TABLE media_files
  ADD COLUMN IF NOT EXISTS base64_data LONGTEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS storage_type ENUM('file','url','base64') DEFAULT 'file';

-- Make path and url nullable for base64-only storage
ALTER TABLE media_files
  MODIFY COLUMN path VARCHAR(500) DEFAULT NULL,
  MODIFY COLUMN url VARCHAR(500) DEFAULT NULL;

SELECT 'Migration completed: base64 storage support added to media_files table' as message;
