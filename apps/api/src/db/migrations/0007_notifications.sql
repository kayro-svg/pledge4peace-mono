-- notifications table and indices
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  meta TEXT,
  actor_id TEXT,
  resource_type TEXT,
  resource_id TEXT,
  priority TEXT,
  channel TEXT DEFAULT 'inapp',
  created_at INTEGER NOT NULL,
  read_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at);

-- last_seen_notifications_at on users for cheap badge calculations
-- Note: Cloudflare D1 (SQLite) does not support "IF NOT EXISTS" in ALTER TABLE ADD COLUMN
-- This migration runs once per database, so a plain ADD COLUMN is safe here.
ALTER TABLE users ADD COLUMN last_seen_notifications_at INTEGER;

