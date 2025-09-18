PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`order_id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`restaurant_id` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_orders`("order_id", "user_id", "restaurant_id", "status", "created_at") SELECT "order_id", "user_id", "restaurant_id", "status", "created_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `orders_restaurant_idx` ON `orders` (`restaurant_id`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);