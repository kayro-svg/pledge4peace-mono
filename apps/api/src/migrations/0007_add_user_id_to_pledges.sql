-- Crear la tabla de conteo de pledges por campaña si no existe
CREATE TABLE IF NOT EXISTS `campaign_pledge_counts` (
	`campaign_id` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint

-- Crear la tabla de pledges si no existe
CREATE TABLE IF NOT EXISTS `pledges` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`user_id` text NOT NULL,
	`agree_to_terms` integer NOT NULL,
	`subscribe_to_updates` integer NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint