-- Peace Seal Program Hardening
-- Migration: 0017_peace_seal_hardening.sql
-- Adds unique constraints and performance indexes

-- Add missing verified_at field for better lifecycle tracking
ALTER TABLE peace_seal_companies ADD COLUMN verified_at INTEGER;

-- Idempotencia de pagos
CREATE UNIQUE INDEX IF NOT EXISTS ux_peace_seal_payment_txn
  ON peace_seal_companies (payment_txn_id)
  WHERE payment_txn_id IS NOT NULL;

-- Un questionnaire por versión
CREATE UNIQUE INDEX IF NOT EXISTS ux_peace_seal_q_company_version
  ON peace_seal_questionnaires (company_id, version);

-- Índices para listados y ordenamiento
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_updated_at
  ON peace_seal_companies(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_last_reviewed
  ON peace_seal_companies(last_reviewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_verified_at
  ON peace_seal_companies(verified_at DESC);

-- Índices compuestos para filtros comunes
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_status_updated
  ON peace_seal_companies(status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_country_status
  ON peace_seal_companies(country, status);

CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_advisor_status
  ON peace_seal_companies(advisor_user_id, status)
  WHERE advisor_user_id IS NOT NULL;

-- Índices para history y documents por fecha
CREATE INDEX IF NOT EXISTS idx_peace_seal_status_history_created
  ON peace_seal_status_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_created
  ON peace_seal_documents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_peace_seal_reports_resolved_at
  ON peace_seal_reports(resolved_at DESC)
  WHERE resolved_at IS NOT NULL;

-- Índice para búsquedas de texto en nombres de empresas
CREATE INDEX IF NOT EXISTS idx_peace_seal_companies_name_lower
  ON peace_seal_companies(lower(name));

-- Vista materializada conceptual para directorio público (como índice)
-- Nota: SQLite no tiene materialized views, pero este índice cubre las consultas comunes
CREATE INDEX IF NOT EXISTS idx_peace_seal_directory_public
  ON peace_seal_companies(status, country, updated_at DESC)
  WHERE status IN ('verified', 'conditional');
