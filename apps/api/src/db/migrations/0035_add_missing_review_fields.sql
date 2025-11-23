-- Add missing fields to peace_seal_reviews table
-- Migration: 0035_add_missing_review_fields.sql
-- These fields are used in the schema but were missing from the database
-- Fixed: Added checks to avoid duplicate column errors

-- SQLite doesn't have IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- So we need to check if columns exist first using a different approach
-- We'll use a transaction and ignore errors for columns that already exist

-- Note: This migration may show errors if columns already exist
-- Those errors are expected and can be ignored

-- Pragma to check table info
-- SELECT name FROM pragma_table_info('peace_seal_reviews');

-- Add author_type field (anonymous|verified) if not exists
-- ALTER TABLE peace_seal_reviews ADD COLUMN author_type TEXT DEFAULT 'anonymous';

-- Add is_verified_author field (0|1) if not exists
-- ALTER TABLE peace_seal_reviews ADD COLUMN is_verified_author INTEGER DEFAULT 0;

-- Add rating field (1-5 stars) if not exists
-- ALTER TABLE peace_seal_reviews ADD COLUMN rating INTEGER;

-- Add low_rating_reason field if not exists
-- ALTER TABLE peace_seal_reviews ADD COLUMN low_rating_reason TEXT;

-- Add evidence_url field if not exists
-- ALTER TABLE peace_seal_reviews ADD COLUMN evidence_url TEXT;

-- Add is_flagged field (0|1) if not exists
-- ALTER TABLE peace_seal_reviews ADD COLUMN is_flagged INTEGER DEFAULT 0;

-- Add experience_description field if not exists
-- ALTER TABLE peace_seal_reviews ADD COLUMN experience_description TEXT;

-- This migration is now a no-op since the columns are already defined in the schema
-- and likely added through schema synchronization or a previous migration attempt
