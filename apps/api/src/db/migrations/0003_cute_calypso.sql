-- Add party_id column with default value for existing solutions
ALTER TABLE solutions ADD `party_id` text NOT NULL DEFAULT 'israeli';

-- Update existing solutions to have a balanced distribution
UPDATE solutions SET party_id = 'palestinian' WHERE rowid % 2 = 0;