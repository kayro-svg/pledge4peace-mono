ALTER TABLE users ADD `user_type` text DEFAULT 'citizen';--> statement-breakpoint
ALTER TABLE users ADD `office` text;--> statement-breakpoint
ALTER TABLE users ADD `organization` text;--> statement-breakpoint
ALTER TABLE users ADD `institution` text;--> statement-breakpoint
ALTER TABLE users ADD `other_role` text;