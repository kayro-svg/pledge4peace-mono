
 ⛅️ wrangler 4.15.2 (update available 4.19.1)
---------------------------------------------

🌀 Executing on local database pledge4peace-db (98d32d18-205e-49ef-8e8e-342df08868da) from .wrangler/state/v3/d1:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
🚣 1 command executed successfully.
[
  {
    "results": [
      {
        "sql": "CREATE TABLE users (\n    id TEXT PRIMARY KEY,\n    email TEXT NOT NULL UNIQUE,\n    name TEXT NOT NULL,\n    password TEXT NOT NULL,\n    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),\n    created_at INTEGER NOT NULL,\n    updated_at INTEGER NOT NULL\n, email_verified INTEGER DEFAULT 0 NOT NULL, verification_token TEXT, verification_token_expires_at INTEGER, reset_token TEXT, reset_token_expires_at INTEGER, image TEXT)"
      },
      {
        "sql": "CREATE TABLE solutions (\n    id TEXT PRIMARY KEY,\n    campaign_id TEXT NOT NULL,\n    user_id TEXT NOT NULL,\n    title TEXT NOT NULL,\n    description TEXT NOT NULL,\n    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),\n    created_at INTEGER NOT NULL,\n    updated_at INTEGER NOT NULL,\n    metadata TEXT,\n    FOREIGN KEY (user_id) REFERENCES users(id)\n)"
      },
      {
        "sql": "CREATE TABLE comments (\n    id TEXT PRIMARY KEY,\n    solution_id TEXT NOT NULL,\n    user_id TEXT NOT NULL,\n    content TEXT NOT NULL,\n    created_at INTEGER NOT NULL,\n    updated_at INTEGER NOT NULL,\n    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'hidden')),\n    parent_id TEXT, user_name TEXT, user_avatar TEXT,\n    FOREIGN KEY (solution_id) REFERENCES solutions(id),\n    FOREIGN KEY (parent_id) REFERENCES comments(id),\n    FOREIGN KEY (user_id) REFERENCES users(id)\n)"
      },
      {
        "sql": "CREATE TABLE solution_interactions (\n    id TEXT PRIMARY KEY,\n    solution_id TEXT NOT NULL,\n    user_id TEXT NOT NULL,\n    type TEXT NOT NULL CHECK (type IN ('like', 'dislike', 'share')),\n    created_at INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'active',\n    FOREIGN KEY (solution_id) REFERENCES solutions(id),\n    FOREIGN KEY (user_id) REFERENCES users(id)\n)"
      },
      {
        "sql": "CREATE TABLE _cf_METADATA (\n        key INTEGER PRIMARY KEY,\n        value BLOB\n      )"
      },
      {
        "sql": "CREATE TABLE d1_migrations(\n\t\tid         INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\tname       TEXT UNIQUE,\n\t\tapplied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL\n)"
      },
      {
        "sql": "CREATE TABLE sqlite_sequence(name,seq)"
      },
      {
        "sql": "CREATE TABLE `campaign_pledge_counts` (\n  `campaign_id` text PRIMARY KEY NOT NULL,\n  `count` integer DEFAULT 0 NOT NULL,\n  `last_updated` integer NOT NULL\n)"
      },
      {
        "sql": "CREATE TABLE `pledges` (\n  `id` text PRIMARY KEY NOT NULL,\n  `campaign_id` text NOT NULL,\n  `user_id` text NOT NULL,\n  `agree_to_terms` integer NOT NULL,\n  `subscribe_to_updates` integer NOT NULL,\n  `created_at` integer NOT NULL,\n  `status` text DEFAULT 'active' NOT NULL\n)"
      }
    ],
    "success": true,
    "meta": {
      "duration": 1
    }
  }
]
