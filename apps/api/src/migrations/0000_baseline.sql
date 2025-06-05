-- apps/api/src/migrations/0000_baseline.sql
-- Migration number: 0000   2025-06-05T00:00:00.000Z
-- Re‐crea todo el esquema “desde cero”, incluyendo el valor 'deleted' en users.status.
-- D1 no admite BEGIN/COMMIT en migraciones, por eso se quitan.

-- ========================================================================
-- 0) Eliminar tablas de aplicación antiguas (si existen), en el orden correcto
-- ========================================================================
DROP TABLE IF EXISTS pledges;
DROP TABLE IF EXISTS campaign_pledge_counts;
DROP TABLE IF EXISTS solution_interactions;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS solutions;
DROP TABLE IF EXISTS users;

-- ========================================================================
-- 1) Tabla “users”
--    Incluye TODOS los campos finales, y ahora permite status = 'deleted'
-- ========================================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'banned', 'deleted')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  verification_token_expires_at INTEGER,
  reset_token TEXT,
  reset_token_expires_at INTEGER,
  image TEXT
);

-- ========================================================================
-- 2) Tabla “solutions”
-- ========================================================================
CREATE TABLE IF NOT EXISTS solutions (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  metadata TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================================================
-- 3) Tabla “comments”
-- ========================================================================
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  solution_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deleted', 'hidden')),
  parent_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  FOREIGN KEY (solution_id) REFERENCES solutions(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================================================
-- 4) Tabla “solution_interactions”
-- ========================================================================
CREATE TABLE IF NOT EXISTS solution_interactions (
  id TEXT PRIMARY KEY,
  solution_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('like', 'dislike', 'share')),
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (solution_id) REFERENCES solutions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================================================
-- 5) Tabla “campaign_pledge_counts”
-- ========================================================================
CREATE TABLE IF NOT EXISTS campaign_pledge_counts (
  campaign_id TEXT PRIMARY KEY NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_updated INTEGER NOT NULL
);

-- ========================================================================
-- 6) Tabla “pledges”
-- ========================================================================
CREATE TABLE IF NOT EXISTS pledges (
  id TEXT PRIMARY KEY NOT NULL,
  campaign_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  agree_to_terms INTEGER NOT NULL,
  subscribe_to_updates INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (campaign_id) REFERENCES campaign_pledge_counts(campaign_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
