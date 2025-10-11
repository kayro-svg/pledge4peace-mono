-- Add user_id column to peace_seal_reviews table
-- Migration: 0025_add_user_id_to_reviews.sql
-- Date: 2025-01-24

-- Add user_id column to track which user created the review
ALTER TABLE peace_seal_reviews ADD COLUMN user_id TEXT REFERENCES users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_reviews_user ON peace_seal_reviews(user_id);
