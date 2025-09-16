-- Migration: Add nonprofit column to users table
-- Migration number: 0015 2025-09-16T00:00:00.000Z

ALTER TABLE users ADD COLUMN nonprofit TEXT;

-- Opcional: índice si consultas por nonprofit
-- CREATE INDEX idx_users_nonprofit ON users(nonprofit);
