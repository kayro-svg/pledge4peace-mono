-- Recreate users table to widen CHECK constraints for role and status
PRAGMA foreign_keys=OFF;

CREATE TABLE users_new (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  image TEXT,
  password TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','banned','deleted')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','moderator','admin','superAdmin')),
  user_type TEXT DEFAULT 'citizen',
  office TEXT,
  organization TEXT,
  institution TEXT,
  other_role TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  verification_token_expires_at INTEGER,
  reset_token TEXT,
  reset_token_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT INTO users_new (
  id,email,name,image,password,status,role,user_type,office,organization,institution,other_role,
  email_verified,verification_token,verification_token_expires_at,reset_token,reset_token_expires_at,created_at,updated_at
)
SELECT
  id,email,name,image,password,status,role,user_type,office,organization,institution,other_role,
  email_verified,verification_token,verification_token_expires_at,reset_token,reset_token_expires_at,created_at,updated_at
FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes lost during table recreation
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

PRAGMA foreign_keys=ON;