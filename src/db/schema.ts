import {
  sqliteTable,
  text,
  integer,
  real,
  unique,
  index,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    fullName: text("full_name"),
    isRestaurantOwner: integer("is_restaurant_owner", { mode: "boolean" })
      .notNull()
      .default(false),
    passwordHash: text("password_hash"), // <-- new
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
  })
);
export const restaurants = sqliteTable(
  "restaurants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at")
      .notNull()
      .default(Math.floor(Date.now() / 1000)),
  },
  (t) => ({
    ownerIdx: index("restaurants_owner_idx").on(t.ownerId),
    uniqNamePerOwner: unique().on(t.ownerId, t.name),
  })
);

export const menuItems = sqliteTable(
  "menu_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    price: real("price").notNull(),
    description: text("description"),
    category: text("category"),
    available: integer("available", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: integer("created_at")
      .notNull()
      .default(Math.floor(Date.now() / 1000)),
  },
  (t) => ({
    uniqPerRestaurant: unique().on(t.restaurantId, t.name),
    restaurantIdx: index("menu_items_restaurant_idx").on(t.restaurantId),
  })
);

export const orders = sqliteTable(
  "orders",
  {
    id: text("order_id").primaryKey(), // uuid string
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "restrict" }),
    status: text("status", {
      enum: ["pending", "confirmed", "preparing", "completed", "cancelled"],
    })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at").notNull().default(Date.now()),
  },
  (t) => ({
    restIdx: index("orders_restaurant_idx").on(t.restaurantId),
    userIdx: index("orders_user_idx").on(t.userId),
    createdIdx: index("orders_created_idx").on(t.createdAt),
  })
);

export const orderItems = sqliteTable(
  "order_items",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    // FK to menu item for lineage (may be null if deleted)
    menuItemId: integer("menu_item_id").references(() => menuItems.id, {
      onDelete: "set null",
    }),

    quantity: integer("quantity").notNull().default(1),

    // Snapshot fields — immutable once created
    menuName: text("menu_name").notNull(),
    unitPrice: real("unit_price").notNull(),

    itemSubtotal: real("item_subtotal").notNull().default(0), // quantity * unitPrice
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  })
);

// (Optional) drizzle relations if you plan to use db.query.* APIs
export const restaurantsRelations = relations(restaurants, ({ many, one }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id],
  }),
  menuItems: many(menuItems),
  orders: many(orders),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
}));
