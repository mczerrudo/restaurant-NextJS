DROP INDEX "menu_items_restaurant_idx";--> statement-breakpoint
DROP INDEX "menu_items_restaurant_id_name_unique";--> statement-breakpoint
DROP INDEX "order_items_order_idx";--> statement-breakpoint
DROP INDEX "orders_restaurant_idx";--> statement-breakpoint
DROP INDEX "orders_user_idx";--> statement-breakpoint
DROP INDEX "orders_created_idx";--> statement-breakpoint
DROP INDEX "restaurants_owner_idx";--> statement-breakpoint
DROP INDEX "restaurants_owner_id_name_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_email_idx";--> statement-breakpoint
ALTER TABLE `menu_items` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT 1757991505;--> statement-breakpoint
CREATE INDEX `menu_items_restaurant_idx` ON `menu_items` (`restaurant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `menu_items_restaurant_id_name_unique` ON `menu_items` (`restaurant_id`,`name`);--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `orders_restaurant_idx` ON `orders` (`restaurant_id`);--> statement-breakpoint
CREATE INDEX `orders_user_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_created_idx` ON `orders` (`created_at`);--> statement-breakpoint
CREATE INDEX `restaurants_owner_idx` ON `restaurants` (`owner_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `restaurants_owner_id_name_unique` ON `restaurants` (`owner_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `order_items` ALTER COLUMN "item_subtotal" TO "item_subtotal" real NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT 1757991505;--> statement-breakpoint
ALTER TABLE `restaurants` ALTER COLUMN "created_at" TO "created_at" integer NOT NULL DEFAULT 1757991505;