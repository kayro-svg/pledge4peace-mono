
 ⛅️ wrangler 4.15.2 (update available 4.19.1)
---------------------------------------------

🌀 Executing on remote database pledge4peace-db (98d32d18-205e-49ef-8e8e-342df08868da):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 command in 0.3295ms
[
  {
    "results": [
      {
        "sql": "CREATE TABLE _cf_KV (\n        key TEXT PRIMARY KEY,\n        value BLOB\n      ) WITHOUT ROWID"
      },
      {
        "sql": "CREATE TABLE d1_migrations(\n\t\tid         INTEGER PRIMARY KEY AUTOINCREMENT,\n\t\tname       TEXT UNIQUE,\n\t\tapplied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL\n)"
      },
      {
        "sql": "CREATE TABLE sqlite_sequence(name,seq)"
      },
      {
        "sql": "CREATE TABLE solutions (\n    id TEXT PRIMARY KEY,\n    campaign_id TEXT NOT NULL,\n    user_id TEXT NOT NULL,\n    title TEXT NOT NULL,\n    description TEXT NOT NULL,\n    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),\n    created_at INTEGER NOT NULL,\n    updated_at INTEGER NOT NULL,\n    metadata TEXT\n)"
      },
      {
        "sql": "CREATE TABLE comments (\n    id TEXT PRIMARY KEY,\n    solution_id TEXT NOT NULL,\n    user_id TEXT NOT NULL,\n    content TEXT NOT NULL,\n    created_at INTEGER NOT NULL,\n    updated_at INTEGER NOT NULL,\n    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'hidden')),\n    parent_id TEXT, user_name TEXT, user_avatar TEXT,\n    FOREIGN KEY (solution_id) REFERENCES solutions(id),\n    FOREIGN KEY (parent_id) REFERENCES comments(id)\n)"
      },
      {
        "sql": "CREATE TABLE solution_interactions (\n    id TEXT PRIMARY KEY,\n    solution_id TEXT NOT NULL,\n    user_id TEXT NOT NULL,\n    type TEXT NOT NULL CHECK (type IN ('like', 'dislike', 'share')),\n    created_at INTEGER NOT NULL,\n    FOREIGN KEY (solution_id) REFERENCES solutions(id)\n)"
      },
      {
        "sql": "CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')), created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, email_verified INTEGER DEFAULT 0 NOT NULL, verification_token TEXT, verification_token_expires_at INTEGER, reset_token TEXT, reset_token_expires_at INTEGER, image TEXT)"
      },
      {
        "sql": "CREATE TABLE `campaign_pledge_counts` (\n\t`campaign_id` text PRIMARY KEY NOT NULL,\n\t`count` integer DEFAULT 0 NOT NULL,\n\t`last_updated` integer NOT NULL\n)"
      },
      {
        "sql": "CREATE TABLE `pledges` (\n\t`id` text PRIMARY KEY NOT NULL,\n\t`campaign_id` text NOT NULL,\n\t`user_id` text NOT NULL,\n\t`agree_to_terms` integer NOT NULL,\n\t`subscribe_to_updates` integer NOT NULL,\n\t`created_at` integer NOT NULL,\n\t`status` text DEFAULT 'active' NOT NULL\n)"
      }
    ],
    "success": true,
    "meta": {
      "served_by": "v3-prod",
      "served_by_region": "ENAM",
      "served_by_primary": true,
      "timings": {
        "sql_duration_ms": 0.3295
      },
      "duration": 0.3295,
      "changes": 0,
      "last_row_id": 0,
      "changed_db": false,
      "size_after": 77824,
      "rows_read": 17,
      "rows_written": 0
    }
  }
]
