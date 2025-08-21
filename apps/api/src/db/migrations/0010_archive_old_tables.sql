-- Archive legacy *_old tables by renaming to avoid future name conflicts
PRAGMA defer_foreign_keys = true;

-- Only rename if they exist
ALTER TABLE solutions_old RENAME TO archived_solutions_20250821;
ALTER TABLE users_old RENAME TO archived_users_20250821;

-- Note: We intentionally do NOT drop to avoid FK issues in D1
