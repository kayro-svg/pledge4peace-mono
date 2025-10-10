-- Migration to safely add community columns to peace_seal_companies
-- This migration handles the case where columns might already exist

-- Add community_listed column if it doesn't exist
ALTER TABLE peace_seal_companies ADD COLUMN community_listed INTEGER NOT NULL DEFAULT 0;

-- Add employee rating columns if they don't exist
ALTER TABLE peace_seal_companies ADD COLUMN employee_rating_avg INTEGER;
ALTER TABLE peace_seal_companies ADD COLUMN employee_rating_count INTEGER NOT NULL DEFAULT 0;

-- Add overall rating columns if they don't exist
ALTER TABLE peace_seal_companies ADD COLUMN overall_rating_avg INTEGER;
ALTER TABLE peace_seal_companies ADD COLUMN overall_rating_count INTEGER NOT NULL DEFAULT 0;

-- Note: We cannot make created_by_user_id nullable in SQLite without recreating the table
-- For now, we'll use a special user ID "community-user" for community listings
-- This user should be created in the users table if it doesn't exist
