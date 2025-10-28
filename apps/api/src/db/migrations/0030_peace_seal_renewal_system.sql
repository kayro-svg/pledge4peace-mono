-- Peace Seal Renewal System and Badge Management
-- Migration: 0030_peace_seal_renewal_system.sql
-- Date: 2025-01-23

-- Add renewal and badge management columns to peace_seal_companies
ALTER TABLE peace_seal_companies ADD COLUMN badge_level TEXT; -- bronze|silver|gold|null
ALTER TABLE peace_seal_companies ADD COLUMN renewal_amount_cents INTEGER; -- Annual renewal fee
ALTER TABLE peace_seal_companies ADD COLUMN renewal_due_date INTEGER; -- When renewal is due
ALTER TABLE peace_seal_companies ADD COLUMN peace_seal_center_access INTEGER NOT NULL DEFAULT 0; -- 0|1
ALTER TABLE peace_seal_companies ADD COLUMN digital_badge_url TEXT; -- URL to downloadable badge
ALTER TABLE peace_seal_companies ADD COLUMN physical_badge_requested INTEGER NOT NULL DEFAULT 0; -- 0|1
ALTER TABLE peace_seal_companies ADD COLUMN physical_badge_shipped INTEGER NOT NULL DEFAULT 0; -- 0|1

-- Create table for Peace Seal renewals
CREATE TABLE IF NOT EXISTS peace_seal_renewals (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  renewal_year INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending|paid|failed|refunded
  payment_transaction_id TEXT,
  payment_date INTEGER,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id)
);

-- Create table for Peace Seal rewards and benefits tracking
CREATE TABLE IF NOT EXISTS peace_seal_rewards (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  reward_type TEXT NOT NULL, -- digital_badge|physical_badge|certificate|brand_toolkit|network_access|survey_access
  status TEXT NOT NULL DEFAULT 'pending', -- pending|delivered|used|expired
  delivered_at INTEGER,
  expires_at INTEGER,
  metadata TEXT, -- JSON string for additional data
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id)
);

-- Create table for Peace Seal Center resources
CREATE TABLE IF NOT EXISTS peace_seal_center_resources (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL, -- document|template|guide|tool|survey
  file_url TEXT,
  category TEXT NOT NULL, -- hr_policies|supplier_codes|peace_statements|political_guidelines|compliance
  is_public INTEGER NOT NULL DEFAULT 0, -- 0|1 - whether available to all certified companies
  access_level TEXT NOT NULL DEFAULT 'certified', -- certified|premium|all
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_renewals_company ON peace_seal_renewals(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_renewals_year ON peace_seal_renewals(renewal_year);
CREATE INDEX IF NOT EXISTS idx_peace_seal_renewals_status ON peace_seal_renewals(payment_status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_renewals_expires ON peace_seal_renewals(expires_at);

CREATE INDEX IF NOT EXISTS idx_peace_seal_rewards_company ON peace_seal_rewards(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_rewards_type ON peace_seal_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_peace_seal_rewards_status ON peace_seal_rewards(status);

CREATE INDEX IF NOT EXISTS idx_peace_seal_center_resources_type ON peace_seal_center_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_peace_seal_center_resources_category ON peace_seal_center_resources(category);
CREATE INDEX IF NOT EXISTS idx_peace_seal_center_resources_access ON peace_seal_center_resources(access_level);

CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_badge_level ON peace_seal_companies(badge_level);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_renewal_due ON peace_seal_companies(renewal_due_date);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_center_access ON peace_seal_companies(peace_seal_center_access);
