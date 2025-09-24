-- Migration to add R2 support fields to peace_seal_documents table
-- Date: 2025-01-22

-- Add new fields for R2 file tracking
ALTER TABLE peace_seal_documents ADD COLUMN mime_type TEXT;
ALTER TABLE peace_seal_documents ADD COLUMN section_id TEXT;
ALTER TABLE peace_seal_documents ADD COLUMN field_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_section_field ON peace_seal_documents (section_id, field_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_company_section ON peace_seal_documents (company_id, section_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_documents_created_at ON peace_seal_documents (created_at);
