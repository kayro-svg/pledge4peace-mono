CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`solution_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`parent_id` text,
	FOREIGN KEY (`solution_id`) REFERENCES `solutions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `solutions` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`rank` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `solution_interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`solution_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`solution_id`) REFERENCES `solutions`(`id`) ON UPDATE no action ON DELETE no action
);
