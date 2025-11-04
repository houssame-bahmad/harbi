-- Add project_title column to reviews table
ALTER TABLE reviews 
ADD COLUMN project_title VARCHAR(255) AFTER review_text;
