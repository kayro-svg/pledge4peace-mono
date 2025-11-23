-- Peace Seal Agreement Acceptances Table
-- Migration: 0032_peace_seal_agreement_acceptances.sql
-- Date: 2025-01-25

CREATE TABLE IF NOT EXISTS peace_seal_agreement_acceptances (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  field_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  accepted_by_user_id TEXT NOT NULL,
  acceptance_data TEXT,
  accepted_at INTEGER NOT NULL,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id),
  FOREIGN KEY(template_id) REFERENCES peace_seal_center_resources(id),
  FOREIGN KEY(accepted_by_user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_agreement_acceptances_company ON peace_seal_agreement_acceptances(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_agreement_acceptances_section_field ON peace_seal_agreement_acceptances(section_id, field_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_agreement_acceptances_template ON peace_seal_agreement_acceptances(template_id);

