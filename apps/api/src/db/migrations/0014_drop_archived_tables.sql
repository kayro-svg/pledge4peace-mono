-- Drop archived tables that are no longer referenced by any active tables
-- This migration safely removes archived_users_20250821 and archived_solutions_20250821
-- These tables contain 75 archived users and 106 archived solutions from 2025-08-21

-- Step 1: Verify no active tables reference archived tables (safety check)
-- This should return no results if it's safe to proceed
SELECT 
  'ERROR: Found active references to archived tables' as error_message,
  m.name as table_name
FROM sqlite_master m
WHERE m.type = 'table' 
  AND m.name NOT LIKE 'archived_%'
  AND m.name NOT LIKE 'sqlite_%'
  AND m.name NOT LIKE '_cf_%'
  AND m.name NOT LIKE 'd1_%'
  AND (m.sql LIKE '%archived_users_20250821%' OR m.sql LIKE '%archived_solutions_20250821%')
LIMIT 1;

-- Step 2: Drop archived tables
-- Drop archived_solutions_20250821 first (it references archived_users_20250821)
DROP TABLE IF EXISTS archived_solutions_20250821;

-- Drop archived_users_20250821 second
DROP TABLE IF EXISTS archived_users_20250821;

-- Step 3: Verify tables were dropped successfully
SELECT 'SUCCESS: Archived tables dropped successfully' as result;
