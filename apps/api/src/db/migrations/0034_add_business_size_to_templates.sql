-- Add business_size column to peace_seal_center_resources
-- Migration: 0034_add_business_size_to_templates.sql
-- Date: 2025-01-25

ALTER TABLE peace_seal_center_resources ADD COLUMN business_size TEXT;

-- Update existing templates to add business_size
UPDATE peace_seal_center_resources SET business_size = 'all' WHERE resource_type = 'template';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_peace_seal_center_resources_business_size ON peace_seal_center_resources(business_size);

