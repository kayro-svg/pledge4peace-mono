-- Cleanup legacy tables left from FK-safe swaps
PRAGMA foreign_keys=OFF;

DROP TABLE IF EXISTS solutions_old;
DROP TABLE IF EXISTS users_old;

PRAGMA foreign_keys=ON;
