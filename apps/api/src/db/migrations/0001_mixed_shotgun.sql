CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`password` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`email_verified` integer DEFAULT 0 NOT NULL,
	`verification_token` text,
	`verification_token_expires_at` integer,
	`reset_token` text,
	`reset_token_expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `campaign_pledge_counts` (
	`campaign_id` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pledges` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`user_id` text NOT NULL,
	`agree_to_terms` integer NOT NULL,
	`subscribe_to_updates` integer NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
/*
 SQLite does not support "Set default to column" out of the box, we do not generate automatic migration for that, so it has to be done manually
 Please refer to: https://www.techonthenet.com/sqlite/tables/alter_table.php
                  https://www.sqlite.org/lang_altertable.html
                  https://stackoverflow.com/questions/2083543/modify-a-columns-type-in-sqlite3

 Due to that we don't generate migration automatically and it has to be done manually
*/--> statement-breakpoint
ALTER TABLE comments ADD `user_name` text;--> statement-breakpoint
ALTER TABLE comments ADD `user_avatar` text;--> statement-breakpoint
ALTER TABLE solutions ADD `user_id` text NOT NULL;--> statement-breakpoint
ALTER TABLE solutions ADD `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE solutions ADD `metadata` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `solutions` DROP COLUMN `content`;--> statement-breakpoint
ALTER TABLE `solutions` DROP COLUMN `rank`;--> statement-breakpoint
ALTER TABLE `solutions` DROP COLUMN `created_by`;