-- Migration number: 0003 	 2024-03-26T00:00:00.000Z

-- Add password reset fields to users table
ALTER TABLE users ADD COLUMN reset_token TEXT;
ALTER TABLE users ADD COLUMN reset_token_expires_at INTEGER; 