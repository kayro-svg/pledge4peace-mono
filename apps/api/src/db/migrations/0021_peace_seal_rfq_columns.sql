-- Add RFQ columns to peace_seal_companies table
ALTER TABLE peace_seal_companies ADD COLUMN rfq_status TEXT;
ALTER TABLE peace_seal_companies ADD COLUMN rfq_requested_at INTEGER;
ALTER TABLE peace_seal_companies ADD COLUMN rfq_quoted_amount_cents INTEGER;
