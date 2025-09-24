-- Fix peace_seal_documents table structure
-- Migration: 0020_fix_peace_seal_documents.sql
-- Date: 2025-01-23

-- First, create all Peace Seal tables if they don't exist
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
  verified_at INTEGER,
  expires_at INTEGER,
  renewal_reminder_sent INTEGER NOT NULL DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS peace_seal_reports (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  reporter_email TEXT,
  reporter_name TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  resolved_by_user_id TEXT,
  resolution_notes TEXT,
  created_at INTEGER NOT NULL,
  resolved_at INTEGER,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id),
  FOREIGN KEY(resolved_by_user_id) REFERENCES users(id)
);

-- Drop and recreate peace_seal_documents table with all required columns
DROP TABLE IF EXISTS peace_seal_documents;

CREATE TABLE peace_seal_documents (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  section_id TEXT,
  field_id TEXT,
  uploaded_by_user_id TEXT,
  verified_by_advisor INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id),
  FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id)
);

-- Create all necessary indexes
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_slug ON peace_seal_companies(slug);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_status ON peace_seal_companies(status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_created_by ON peace_seal_companies(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_expires_at ON peace_seal_companies(expires_at);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_advisor ON peace_seal_companies(advisor_user_id);

CREATE INDEX IF NOT EXISTS idx_peace_seal_questionnaires_company ON peace_seal_questionnaires(company_id);

CREATE INDEX IF NOT EXISTS idx_peace_seal_status_history_company ON peace_seal_status_history(company_id);

CREATE INDEX IF NOT EXISTS idx_peace_seal_reports_company ON peace_seal_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_reports_status ON peace_seal_reports(status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_reports_created_at ON peace_seal_reports(created_at);

CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_company ON peace_seal_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_type ON peace_seal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_verified ON peace_seal_documents(verified_by_advisor);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_section_field ON peace_seal_documents (section_id, field_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_company_section ON peace_seal_documents (company_id, section_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_created_at ON peace_seal_documents (created_at);
