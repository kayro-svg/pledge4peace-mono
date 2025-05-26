-- Migration number: 0001 	 2024-03-26T00:00:00.000Z

-- Create users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
); 