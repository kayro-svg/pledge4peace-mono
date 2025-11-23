-- Peace Seal Program Extensions
-- Migration: 0016_peace_seal_extensions.sql
-- Adds missing fields and new tables for reports and documents

-- Add missing fields to peace_seal_companies
ALTER TABLE peace_seal_companies ADD COLUMN expires_at INTEGER;
ALTER TABLE peace_seal_companies ADD COLUMN renewal_reminder_sent INTEGER NOT NULL DEFAULT 0;

-- Create peace_seal_reports table for public reporting system
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

-- Create peace_seal_documents table for document management
CREATE TABLE IF NOT EXISTS peace_seal_documents (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by_user_id TEXT,
  verified_by_advisor INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id),
  FOREIGN KEY(uploaded_by_user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_expires_at ON peace_seal_companies(expires_at);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_advisor ON peace_seal_companies(advisor_user_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_reports_company ON peace_seal_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_reports_status ON peace_seal_reports(status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_reports_created_at ON peace_seal_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_company ON peace_seal_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_type ON peace_seal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_verified ON peace_seal_documents(verified_by_advisor);
