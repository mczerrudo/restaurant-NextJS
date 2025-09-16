CREATE TABLE `menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`restaurant_id` integer NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`description` text,
	`category` text,
	`available` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000) NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `menu_items_restaurant_idx` ON `menu_items` (`restaurant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `menu_items_restaurant_id_name_unique` ON `menu_items` (`restaurant_id`,`name`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`menu_item_id` integer,
	`quantity` integer DEFAULT 1 NOT NULL,
	`menu_name` text NOT NULL,
	`unit_price` real NOT NULL,
	`item_subtotal` real DEFAULT 0 NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`order_id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`restaurant_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `orders_restaurant_idx` ON `orders` (`restaurant_id`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000) NOT NULL,
	`rating_avg` real DEFAULT 0 NOT NULL,
	`rating_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `restaurants_owner_idx` ON `restaurants` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `restaurants_owner_id_name_unique` ON `restaurants` (`owner_id`,`name`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`restaurant_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` integer DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000) NOT NULL,
	`updated_at` integer DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reviews_restaurant_idx` ON `reviews` (`restaurant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_user_id_restaurant_id_unique` ON `reviews` (`user_id`,`restaurant_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`full_name` text,
	`is_restaurant_owner` integer DEFAULT false NOT NULL,
	`password_hash` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);