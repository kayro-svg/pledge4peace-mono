-- Drop and recreate the tables to match remote schema exactly
DROP TABLE IF EXISTS `campaign_pledge_counts`;
DROP TABLE IF EXISTS `pledges`;

-- Create campaign_pledge_counts table (exact schema from remote)
CREATE TABLE `campaign_pledge_counts` (
  `campaign_id` text PRIMARY KEY NOT NULL,
  `count` integer DEFAULT 0 NOT NULL,
  `last_updated` integer NOT NULL
);

-- Create pledges table (exact schema from remote)
CREATE TABLE `pledges` (
  `id` text PRIMARY KEY NOT NULL,
  `campaign_id` text NOT NULL,
  `user_id` text NOT NULL,
  `agree_to_terms` integer NOT NULL,
  `subscribe_to_updates` integer NOT NULL,
  `created_at` integer NOT NULL,
  `status` text DEFAULT 'active' NOT NULL
);
