-- Add notification preferences to users
ALTER TABLE users ADD COLUMN notify_inapp INTEGER NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN notify_email INTEGER NOT NULL DEFAULT 1;

