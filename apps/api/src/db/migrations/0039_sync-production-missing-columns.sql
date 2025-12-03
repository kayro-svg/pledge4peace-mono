-- SQL Script to sync missing columns in production database
-- Execute these commands manually on production database
-- Migration: Sync peace_seal_reviews missing columns

-- Add missing columns to peace_seal_reviews table in production
-- These columns exist in preview but are missing in production

ALTER TABLE peace_seal_reviews ADD COLUMN rating INTEGER;
ALTER TABLE peace_seal_reviews ADD COLUMN low_rating_reason TEXT;
ALTER TABLE peace_seal_reviews ADD COLUMN evidence_url TEXT;
ALTER TABLE peace_seal_reviews ADD COLUMN is_flagged INTEGER DEFAULT 0;

-- Verify columns were added:
-- SELECT name FROM pragma_table_info('peace_seal_reviews') WHERE name IN ('rating', 'low_rating_reason', 'evidence_url', 'is_flagged');

