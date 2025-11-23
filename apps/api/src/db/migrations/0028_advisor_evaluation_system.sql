-- Advisor Evaluation System for Community Reviews
-- Migration: 0028_advisor_evaluation_system.sql
-- Date: 2025-01-23

-- Create table for advisor evaluations of community reviews
CREATE TABLE IF NOT EXISTS peace_seal_review_evaluations (
  id TEXT PRIMARY KEY NOT NULL,
  review_id TEXT NOT NULL,
  advisor_user_id TEXT NOT NULL,
  evaluation_status TEXT NOT NULL DEFAULT 'pending', -- pending|valid|invalid|requires_company_response
  evaluation_notes TEXT,
  company_notified_at INTEGER,
  company_response_deadline INTEGER,
  company_response TEXT,
  company_responded_at INTEGER,
  final_resolution TEXT, -- resolved|unresolved|dismissed
  final_resolution_notes TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY(review_id) REFERENCES peace_seal_reviews(id),
  FOREIGN KEY(advisor_user_id) REFERENCES users(id)
);

-- Create table for tracking company issues (unresolved evaluations)
CREATE TABLE IF NOT EXISTS peace_seal_company_issues (
  id TEXT PRIMARY KEY NOT NULL,
  company_id TEXT NOT NULL,
  evaluation_id TEXT NOT NULL,
  issue_type TEXT NOT NULL, -- review_complaint|policy_violation|other
  severity TEXT NOT NULL DEFAULT 'medium', -- low|medium|high|critical
  status TEXT NOT NULL DEFAULT 'active', -- active|resolved|dismissed
  created_at INTEGER NOT NULL,
  resolved_at INTEGER,
  FOREIGN KEY(company_id) REFERENCES peace_seal_companies(id),
  FOREIGN KEY(evaluation_id) REFERENCES peace_seal_review_evaluations(id)
);

-- Add columns to peace_seal_companies for issue tracking
ALTER TABLE peace_seal_companies ADD COLUMN unresolved_issues_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE peace_seal_companies ADD COLUMN seal_status TEXT NOT NULL DEFAULT 'active'; -- active|suspended|revoked
ALTER TABLE peace_seal_companies ADD COLUMN seal_suspended_at INTEGER;
ALTER TABLE peace_seal_companies ADD COLUMN seal_revoked_at INTEGER;
ALTER TABLE peace_seal_companies ADD COLUMN last_issue_notification_at INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_review_evaluations_review ON peace_seal_review_evaluations(review_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_review_evaluations_advisor ON peace_seal_review_evaluations(advisor_user_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_review_evaluations_status ON peace_seal_review_evaluations(evaluation_status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_review_evaluations_deadline ON peace_seal_review_evaluations(company_response_deadline);

CREATE INDEX IF NOT EXISTS idx_peace_seal_company_issues_company ON peace_seal_company_issues(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_company_issues_evaluation ON peace_seal_company_issues(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_company_issues_status ON peace_seal_company_issues(status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_company_issues_severity ON peace_seal_company_issues(severity);

CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_seal_status ON peace_seal_companies(seal_status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_unresolved_issues ON peace_seal_companies(unresolved_issues_count);
