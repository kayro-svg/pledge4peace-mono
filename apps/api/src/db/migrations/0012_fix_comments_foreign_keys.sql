-- Fix comments foreign keys to point to current tables instead of archived tables
-- This migration safely recreates the comments table with the correct foreign keys

-- Step 1: Disable foreign key checks temporarily
PRAGMA foreign_keys=OFF;

-- Step 2: Create new comments table with correct foreign keys
CREATE TABLE comments_new (
  id TEXT PRIMARY KEY NOT NULL,
  solution_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  parent_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  FOREIGN KEY (solution_id) REFERENCES solutions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments_new(id)
);

-- Step 3: Copy all existing data from old comments table
-- Copy comments where user exists in users table OR archived_users_20250821 table
-- AND where solution exists in solutions table OR archived_solutions_20250821 table
INSERT INTO comments_new (id, solution_id, user_id, content, created_at, updated_at, status, parent_id, user_name, user_avatar)
SELECT c.id, c.solution_id, c.user_id, c.content, c.created_at, c.updated_at, c.status, c.parent_id, c.user_name, c.user_avatar
FROM comments c
WHERE (c.user_id IN (SELECT id FROM users) OR c.user_id IN (SELECT id FROM archived_users_20250821))
  AND (c.solution_id IN (SELECT id FROM solutions) OR c.solution_id IN (SELECT id FROM archived_solutions_20250821));

-- Step 4: Drop the old comments table
DROP TABLE comments;

-- Step 5: Rename new table to comments
ALTER TABLE comments_new RENAME TO comments;

-- Step 6: Re-enable foreign key checks
PRAGMA foreign_keys=ON;

-- Step 7: Verify the foreign key constraint is working
PRAGMA foreign_key_check(comments);
