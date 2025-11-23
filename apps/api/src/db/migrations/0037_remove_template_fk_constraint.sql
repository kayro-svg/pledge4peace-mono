-- Migration: Remove FK constraint from peace_seal_agreement_acceptances.template_id
-- This allows template IDs to reference code-based templates instead of requiring DB records

-- SQLite doesn't support dropping foreign keys directly
-- We need to recreate the table without the FK constraint

-- Step 1: Create new table without FK constraint
CREATE TABLE peace_seal_agreement_acceptances_new (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES peace_seal_companies(id),
  section_id TEXT NOT NULL,
  field_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  accepted_by_user_id TEXT NOT NULL REFERENCES users(id),
  acceptance_data TEXT,
  accepted_at INTEGER NOT NULL
);

-- Step 2: Copy data from old table
INSERT INTO peace_seal_agreement_acceptances_new
SELECT id, company_id, section_id, field_id, template_id, accepted_by_user_id, acceptance_data, accepted_at
FROM peace_seal_agreement_acceptances;

-- Step 3: Drop old table
DROP TABLE peace_seal_agreement_acceptances;

-- Step 4: Rename new table to original name
ALTER TABLE peace_seal_agreement_acceptances_new RENAME TO peace_seal_agreement_acceptances;
