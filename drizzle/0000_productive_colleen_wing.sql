CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`icon` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collection_bookmarks` (
	`collection_id` text NOT NULL,
	`bookmark_id` text NOT NULL,
	`order` integer NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`bookmark_id`) REFERENCES `bookmarks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`order` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collections_name_unique` ON `collections` (`name`);--> statement-breakpoint
CREATE TABLE `theme_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`selected_theme` text DEFAULT 'gruvbox' NOT NULL,
	`custom_primary` text,
	`custom_background` text,
	`custom_text` text,
	`custom_border` text,
	`search_provider` text DEFAULT 'duckduckgo' NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
