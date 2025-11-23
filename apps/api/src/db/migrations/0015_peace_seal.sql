-- Peace Seal Program Tables
-- Migration: 0015_peace_seal.sql

CREATE TABLE IF NOT EXISTS peace_seal_companies (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT,
  website TEXT,
  industry TEXT,
  employee_count INTEGER,
  status TEXT NOT NULL DEFAULT 'application_submitted',
  score INTEGER,
  last_reviewed_at INTEGER,
  notes TEXT,
  advisor_user_id TEXT,
  created_by_user_id TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_amount_cents INTEGER,
  payment_txn_id TEXT,
  payment_date INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(advisor_user_id) REFERENCES users(id),
  FOREIGN KEY(created_by_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS peace_seal_questionnaires (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  responses TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  completed_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id)
);

CREATE TABLE IF NOT EXISTS peace_seal_status_history (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  status TEXT NOT NULL,
  score INTEGER,
  notes TEXT,
  changed_by_user_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id),
  FOREIGN KEY(changed_by_user_id) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_slug ON peace_seal_companies(slug);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_status ON peace_seal_companies(status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_created_by ON peace_seal_companies(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_questionnaires_company ON peace_seal_questionnaires(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_status_history_company ON peace_seal_status_history(company_id);
