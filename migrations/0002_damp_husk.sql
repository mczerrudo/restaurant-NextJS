PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_menu_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`restaurant_id` integer NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`description` text,
	`category` text,
	`available` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000) NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_menu_items`("id", "restaurant_id", "name", "price", "description", "category", "available", "created_at") SELECT "id", "restaurant_id", "name", "price", "description", "category", "available", "created_at" FROM `menu_items`;--> statement-breakpoint
DROP TABLE `menu_items`;--> statement-breakpoint
ALTER TABLE `__new_menu_items` RENAME TO `menu_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `menu_items_restaurant_idx` ON `menu_items` (`restaurant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `menu_items_restaurant_id_name_unique` ON `menu_items` (`restaurant_id`,`name`);