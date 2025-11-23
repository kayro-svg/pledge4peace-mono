-- Migration: 0036_set_default_status_to_draft.sql
-- Documentation: Default status for peace_seal_companies should be 'draft'
-- 
-- Note: SQLite doesn't support ALTER COLUMN to change defaults easily.
-- The schema file (peace-seal.ts) has been updated to set default('draft').
-- The createApplication method explicitly sets status to DRAFT, so this is consistent.
-- 
-- This migration serves as documentation that new companies should start as 'draft'
-- and only transition to 'application_submitted' when the questionnaire is completed (progress 100).


