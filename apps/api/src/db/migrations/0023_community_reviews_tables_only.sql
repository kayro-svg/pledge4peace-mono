-- Migration to add only the community review tables
-- The columns were already added in a previous migration

-- Create peace_seal_reviews table
CREATE TABLE IF NOT EXISTS peace_seal_reviews (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES peace_seal_companies(id),
  role TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_method TEXT,
  reviewer_name TEXT,
  reviewer_email TEXT,
  signed_disclosure INTEGER NOT NULL DEFAULT 0,
  answers TEXT,
  section_scores TEXT,
  total_score INTEGER,
  star_rating INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  verified_at INTEGER
);

-- Create peace_seal_review_verifications table
CREATE TABLE IF NOT EXISTS peace_seal_review_verifications (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES peace_seal_reviews(id),
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_peace_seal_reviews_company ON peace_seal_reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_peace_seal_reviews_status ON peace_seal_reviews(verification_status);
CREATE INDEX IF NOT EXISTS idx_peace_seal_review_verifications_token ON peace_seal_review_verifications(token);
