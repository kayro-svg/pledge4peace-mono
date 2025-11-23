-- Migration to add OAuth verification evidence table
-- Stores proof of OIDC verification without storing raw tokens

CREATE TABLE IF NOT EXISTS peace_seal_oauth_verifications (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES peace_seal_reviews(id),
  provider TEXT NOT NULL, -- 'linkedin', 'google', etc.
  subject TEXT NOT NULL, -- OIDC 'sub' claim
  email TEXT, -- Verified email (optional for auditing)
  email_verified INTEGER DEFAULT 0, -- 0|1
  id_token_hash TEXT NOT NULL, -- SHA-256 hash of id_token for auditing
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_verifications_review ON peace_seal_oauth_verifications(review_id);
CREATE INDEX IF NOT EXISTS idx_oauth_verifications_provider ON peace_seal_oauth_verifications(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_verifications_subject ON peace_seal_oauth_verifications(subject);

