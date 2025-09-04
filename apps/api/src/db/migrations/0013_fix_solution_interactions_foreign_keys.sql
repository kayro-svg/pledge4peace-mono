-- Fix solution_interactions foreign keys to point to current tables instead of archived tables
-- This migration safely recreates the solution_interactions table with the correct foreign keys

-- Step 1: Disable foreign key checks temporarily
PRAGMA foreign_keys=OFF;

-- Step 2: Create new solution_interactions table with correct foreign keys
CREATE TABLE solution_interactions_new (
  id TEXT PRIMARY KEY NOT NULL,
  solution_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (solution_id) REFERENCES solutions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Step 3: Copy all existing data from old solution_interactions table
-- Copy interactions where user exists in users table OR archived_users_20250821 table
-- AND where solution exists in solutions table OR archived_solutions_20250821 table
INSERT INTO solution_interactions_new (id, solution_id, user_id, type, created_at, status)
SELECT si.id, si.solution_id, si.user_id, si.type, si.created_at, si.status
FROM solution_interactions si
WHERE (si.user_id IN (SELECT id FROM users) OR si.user_id IN (SELECT id FROM archived_users_20250821))
  AND (si.solution_id IN (SELECT id FROM solutions) OR si.solution_id IN (SELECT id FROM archived_solutions_20250821));

-- Step 4: Drop the old solution_interactions table
DROP TABLE solution_interactions;

-- Step 5: Rename new table to solution_interactions
ALTER TABLE solution_interactions_new RENAME TO solution_interactions;

-- Step 6: Re-enable foreign key checks
PRAGMA foreign_keys=ON;

-- Step 7: Verify the foreign key constraint is working
PRAGMA foreign_key_check(solution_interactions);
