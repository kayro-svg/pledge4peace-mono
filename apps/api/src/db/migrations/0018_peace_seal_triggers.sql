-- Peace Seal Program Triggers (Optional)
-- Migration: 0018_peace_seal_triggers.sql
-- Auto-update timestamps and maintain data consistency

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Auto-update updated_at on companies table
CREATE TRIGGER IF NOT EXISTS trg_peace_seal_companies_updated
AFTER UPDATE ON peace_seal_companies
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at -- Only trigger if updated_at wasn't manually set
BEGIN
  UPDATE peace_seal_companies
  SET updated_at = CAST(strftime('%s','now') AS INTEGER)
  WHERE id = NEW.id;
END;

-- Auto-update updated_at on questionnaires table
CREATE TRIGGER IF NOT EXISTS trg_peace_seal_questionnaires_updated
AFTER UPDATE ON peace_seal_questionnaires
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at -- Only trigger if updated_at wasn't manually set
BEGIN
  UPDATE peace_seal_questionnaires
  SET updated_at = CAST(strftime('%s','now') AS INTEGER)
  WHERE id = NEW.id;
END;

-- Auto-set verified_at when status changes to 'verified'
CREATE TRIGGER IF NOT EXISTS trg_peace_seal_companies_verified
AFTER UPDATE OF status ON peace_seal_companies
FOR EACH ROW
WHEN NEW.status = 'verified' AND OLD.status != 'verified' AND NEW.verified_at IS NULL
BEGIN
  UPDATE peace_seal_companies
  SET verified_at = CAST(strftime('%s','now') AS INTEGER),
      expires_at = CAST(strftime('%s','now', '+365 days') AS INTEGER)
  WHERE id = NEW.id;
END;

-- Auto-set lastReviewedAt when score changes
CREATE TRIGGER IF NOT EXISTS trg_peace_seal_companies_score_reviewed
AFTER UPDATE OF score ON peace_seal_companies
FOR EACH ROW
WHEN NEW.score IS NOT NULL AND (OLD.score IS NULL OR NEW.score != OLD.score)
BEGIN
  UPDATE peace_seal_companies
  SET last_reviewed_at = CAST(strftime('%s','now') AS INTEGER)
  WHERE id = NEW.id;
END;
