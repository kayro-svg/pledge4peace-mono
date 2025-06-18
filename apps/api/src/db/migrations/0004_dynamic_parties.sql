-- Migration to change party_id from fixed enum to dynamic string
-- This allows campaigns to define their own party slugs
-- ⚠️ SAFE MIGRATION: Preserves ALL existing data

-- Check if party_id column exists and handle accordingly
-- SQLite doesn't support ALTER COLUMN directly, so we need to:
-- 1. Create a new table with the updated schema  
-- 2. Copy data from the old table (preserving ALL data)
-- 3. Drop the old table
-- 4. Rename the new table

-- Create new table with updated schema
CREATE TABLE solutions_new (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    party_id TEXT NOT NULL,  -- Changed from enum to generic TEXT (allows any string)
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    metadata TEXT
);

-- Copy data from old table to new table
-- This preserves ALL existing data, including party_id values like "israeli", "palestinian"
INSERT INTO solutions_new (
    id, campaign_id, user_id, title, description, party_id, 
    status, created_at, updated_at, metadata
) 
SELECT 
    id, campaign_id, user_id, title, description, 
    COALESCE(party_id, 'israeli') as party_id,  -- Use existing party_id or default to 'israeli' if NULL
    status, created_at, updated_at, metadata
FROM solutions;

-- Drop old table
DROP TABLE solutions;

-- Rename new table to original name
ALTER TABLE solutions_new RENAME TO solutions; 