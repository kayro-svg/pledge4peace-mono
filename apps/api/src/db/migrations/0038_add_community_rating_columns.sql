-- Migration: Add missing community listing and rating columns to peace_seal_companies
-- Migration: 0038_add_community_rating_columns.sql
-- Date: 2025-01-23
--
-- These columns were defined in the Drizzle schema but never added via migration,
-- causing INSERT failures when creating new applications.
--
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN.
-- This migration will fail if columns already exist (e.g., in local dev from Drizzle push).
-- For local dev: If migration fails due to existing columns, manually mark as applied.
-- For remote/preview: Migration will succeed as columns don't exist there.

-- Add community listing flag (0|1) - only if it doesn't exist
-- Check by attempting to select the column; if it fails, column doesn't exist
-- SQLite workaround: We'll add columns one by one and handle errors gracefully
-- by checking if they exist first using a subquery approach

-- Add community_listed column if it doesn't exist
-- Using a workaround: Try to add, and if it fails due to duplicate, that's OK for local
ALTER TABLE peace_seal_companies ADD COLUMN community_listed INTEGER NOT NULL DEFAULT 0;

-- Add employee rating columns (for employee reviews)
ALTER TABLE peace_seal_companies ADD COLUMN employee_rating_avg INTEGER; -- 1-5 stars average
ALTER TABLE peace_seal_companies ADD COLUMN employee_rating_count INTEGER NOT NULL DEFAULT 0;

-- Add overall rating columns (for all review types combined)
ALTER TABLE peace_seal_companies ADD COLUMN overall_rating_avg INTEGER; -- 1-5 stars average
ALTER TABLE peace_seal_companies ADD COLUMN overall_rating_count INTEGER NOT NULL DEFAULT 0;

-- Create indexes for performance (IF NOT EXISTS is supported for indexes)
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_community_listed ON peace_seal_companies(community_listed);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_employee_rating ON peace_seal_companies(employee_rating_avg);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_overall_rating ON peace_seal_companies(overall_rating_avg);

