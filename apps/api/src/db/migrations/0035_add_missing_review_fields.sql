-- Add missing fields to peace_seal_reviews table
-- Migration: 0035_add_missing_review_fields.sql
-- These fields are used in the schema but were missing from the database

-- Add author_type field (anonymous|verified)
ALTER TABLE peace_seal_reviews ADD COLUMN author_type TEXT DEFAULT 'anonymous';

-- Add is_verified_author field (0|1)
ALTER TABLE peace_seal_reviews ADD COLUMN is_verified_author INTEGER DEFAULT 0;

-- Add rating field (1-5 stars)
ALTER TABLE peace_seal_reviews ADD COLUMN rating INTEGER;

-- Add low_rating_reason field
ALTER TABLE peace_seal_reviews ADD COLUMN low_rating_reason TEXT;

-- Add evidence_url field
ALTER TABLE peace_seal_reviews ADD COLUMN evidence_url TEXT;

-- Add is_flagged field (0|1)
ALTER TABLE peace_seal_reviews ADD COLUMN is_flagged INTEGER DEFAULT 0;

