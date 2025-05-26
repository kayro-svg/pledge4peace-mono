-- Migration number: 0000 	 2024-01-01T00:00:00.000Z

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

-- Create solutions table
CREATE TABLE solutions (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    metadata TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create comments table
CREATE TABLE comments (
    id TEXT PRIMARY KEY,
    solution_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'hidden')),
    parent_id TEXT,
    FOREIGN KEY (solution_id) REFERENCES solutions(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create solution_interactions table
CREATE TABLE solution_interactions (
    id TEXT PRIMARY KEY,
    solution_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('like', 'dislike', 'share')),
    created_at INTEGER NOT NULL,
    FOREIGN KEY (solution_id) REFERENCES solutions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
); 