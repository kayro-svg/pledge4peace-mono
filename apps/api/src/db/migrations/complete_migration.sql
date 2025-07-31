-- Complete migration script for pledge4peace database
-- Generated from existing migrations

-- Migration 0000: Giant Metal Master
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

CREATE TABLE `solutions` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`party_id` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`metadata` text
);

CREATE TABLE `solution_interactions` (
	`id` text PRIMARY KEY NOT NULL,
	`solution_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`solution_id`) REFERENCES `solutions`(`id`) ON UPDATE no action ON DELETE no action
);

-- Migration 0001: Mixed Shotgun
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`image` text,
	`password` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`role` text DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'superAdmin')),
	`email_verified` integer DEFAULT 0 NOT NULL,
	`verification_token` text,
	`verification_token_expires_at` integer,
	`reset_token` text,
	`reset_token_expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`user_type` text DEFAULT 'citizen',
	`office` text,
	`organization` text,
	`institution` text,
	`other_role` text
);

CREATE TABLE `campaign_pledge_counts` (
	`campaign_id` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`last_updated` integer NOT NULL
);

CREATE TABLE `pledges` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`user_id` text NOT NULL,
	`agree_to_terms` integer NOT NULL,
	`subscribe_to_updates` integer NOT NULL,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
);

-- Add user_name and user_avatar to comments
ALTER TABLE comments ADD `user_name` text;
ALTER TABLE comments ADD `user_avatar` text;

-- Create unique index for users email
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);

-- Create index for users role
CREATE INDEX idx_users_role ON users(role);

-- Create Drizzle migrations table
CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL,
  created_at NUMERIC
); 