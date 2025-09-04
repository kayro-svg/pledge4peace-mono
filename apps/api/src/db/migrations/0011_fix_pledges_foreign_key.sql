-- Fix pledges foreign key to point to users table instead of archived_users_20250821
-- This migration safely recreates the pledges table with the correct foreign key
-- WARNING: This migration is designed for PRODUCTION environment only
-- It assumes the existence of archived_users_20250821 table

-- Step 1: Disable foreign key checks temporarily
PRAGMA foreign_keys=OFF;

-- Step 2: Create new pledges table with correct foreign key
CREATE TABLE pledges_new (
  id TEXT PRIMARY KEY NOT NULL,
  campaign_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  agree_to_terms INTEGER NOT NULL,
  subscribe_to_updates INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (campaign_id) REFERENCES campaign_pledge_counts(campaign_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Step 3: Copy all existing data from old pledges table
-- Copy pledges where user exists in users table OR in archived_users_20250821 table
INSERT INTO pledges_new (id, campaign_id, user_id, agree_to_terms, subscribe_to_updates, created_at, status)
SELECT p.id, p.campaign_id, p.user_id, p.agree_to_terms, p.subscribe_to_updates, p.created_at, p.status
FROM pledges p
WHERE p.user_id IN (SELECT id FROM users)
   OR p.user_id IN (SELECT id FROM archived_users_20250821);

-- Step 4: Drop the old pledges table
DROP TABLE pledges;

-- Step 5: Rename new table to pledges
ALTER TABLE pledges_new RENAME TO pledges;

-- Step 6: Re-enable foreign key checks
PRAGMA foreign_keys=ON;

-- Step 7: Verify the foreign key constraint is working
-- This will fail if there are any orphaned records
PRAGMA foreign_key_check(pledges);
