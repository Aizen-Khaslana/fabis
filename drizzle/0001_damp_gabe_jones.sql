CREATE TABLE `hero_section` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`ppdbYear` text(255) NOT NULL,
	`description` text NOT NULL,
	`heroImage` text DEFAULT 'hero.png' NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);

--> statement-breakpoint
CREATE TABLE `registration_settings` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`pamphletUrl` text DEFAULT '' NOT NULL,
	`formUrl` text DEFAULT '' NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registration_steps` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`title` text(255) NOT NULL,
	`description` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `school_facilities` (
	`id` text(255) PRIMARY KEY NOT NULL,
	`title` text(255) NOT NULL,
	`description` text NOT NULL,
	`image` text DEFAULT 'fabis-default.png' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer
);
