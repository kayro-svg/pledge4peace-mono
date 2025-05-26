-- Migration number: 0002 	 2024-03-26T00:00:00.000Z

-- Add email verification fields to users table
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN verification_token TEXT;
ALTER TABLE users ADD COLUMN verification_token_expires_at INTEGER; 