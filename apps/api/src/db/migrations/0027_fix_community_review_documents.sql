-- Fix community review document uploads
-- Migration: 0027_fix_community_review_documents.sql
-- Date: 2025-01-23

-- The uploaded_by_user_id column is already nullable in the current schema
-- This migration is no longer needed as the column already allows NULL values
-- for anonymous community review document uploads

-- No SQL changes required - column is already properly configured
