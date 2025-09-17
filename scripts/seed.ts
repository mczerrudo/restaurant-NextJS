// scripts/seed.ts
/* 
  Run with:
  pnpm add -D tsx
  pnpm tsx scripts/seed.ts
  or add a package.json script: "db:seed": "tsx scripts/seed.ts"
*/

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import "dotenv/config";

// ---- import your actual schema objects ----
import { restaurants } from "@/db/schema"; // adjust path
import { menuItems } from "@/db/schema";     // adjust path

// If using local SQLite file instead of Turso, set SQLITE_FILE, e.g. .env: SQLITE_FILE="./.data/local.db"
const TURSO_DB_URL = "libsql://restauratant-mczerrudo.aws-ap-northeast-1.turso.io";
const TURSO_DB_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTc5MDMwNTcsImlkIjoiN2M2MTQzNWEtNTljZC00M2YxLTk0MzItNTczZTE5NzhmMDIzIiwicmlkIjoiODIxN2EwNjgtN2FlYi00Y2YxLWJjOTItZGRiNGNhZGQ3ZmJjIn0.Cn199LtSPLrzwdHF4zmNlqf9JUo-8BE0EE0ZhFKSKDuldt3zdvEVrseRS3L8KiTk5HbofDT5qaUCM_msfmIEAw";
const SQLITE_FILE = process.env.SQLITE_FILE;

const client = TURSO_DB_URL
  ? createClient({ url: TURSO_DB_URL, authToken: TURSO_DB_AUTH_TOKEN })
  : createClient({ url: `file:${SQLITE_FILE || "./local.db"}` });

const db = drizzle(client);

const OWNER_ID = 2; // 🔴 CHANGE THIS to a valid users.id in your DB

type SeedRestaurant = {
  name: string;
  description?: string;
  address?: string;
  menus: Array<{
    name: string;
    price: number; // store as number (use REAL or INTEGER cents in your schema)
    description?: string;
    category?: string;
  }>;
};

const nowMs = Date.now();

const seedData: SeedRestaurant[] = [
  {
    name: "Burger Hub",
    description: "A modern burger joint specializing in gourmet burgers with unique toppings.",
    address: "123 Main St, Manila",
    menus: [
      { name: "Classic Cheeseburger", price: 199, description: "Beef, cheddar, lettuce, tomato, onion", category: "Burgers", available: true },
      { name: "Truffle Mushroom Burger", price: 289, description: "Beef, mushrooms, truffle mayo, Swiss", category: "Burgers", available: true },
      { name: "Spicy Chicken Burger", price: 229, description: "Crispy chicken, jalapeños, spicy mayo, pickles", category: "Burgers", available: true },
    ],
  },
  {
    name: "Sushiya Express",
    description: "Casual Japanese focusing on sushi and donburi bowls.",
    address: "45 Sakura Lane, Quezon City",
    menus: [
      { name: "Salmon Nigiri (6 pcs)", price: 350, description: "Fresh salmon over seasoned rice", category: "Sushi", available: true },
      { name: "Tuna Poke Bowl", price: 280, description: "Marinated tuna, sushi rice, avocado, cucumber", category: "Bowls", available: true },
      { name: "Tempura Udon", price: 310, description: "Hot noodle soup with shrimp tempura", category: "Noodles", available: true },
    ],
  },
  {
    name: "Bella Napoli Pizzeria",
    description: "Authentic Italian pizza from a wood-fired oven.",
    address: "77 Roma Ave, Makati",
    menus: [
      { name: "Margherita Pizza", price: 399, description: "Tomato, mozzarella, basil", category: "Pizza", available: true },
      { name: "Quattro Formaggi", price: 480, description: "Mozzarella, gorgonzola, parmesan, provolone", category: "Pizza", available: true },
      { name: "Pepperoni Pizza", price: 420, description: "Tomato, mozzarella, pepperoni", category: "Pizza", available: true },
    ],
  },
  {
    name: "Green Bowl Café",
    description: "Healthy salads, smoothie bowls, and plant-based meals.",
    address: "9 Wellness Street, BGC",
    menus: [
      { name: "Caesar Salad", price: 220, description: "Romaine, parmesan, croutons, Caesar dressing", category: "Salad", available: true },
      { name: "Vegan Buddha Bowl", price: 260, description: "Quinoa, chickpeas, roasted veggies, tahini", category: "Bowls", available: true },
      { name: "Acai Smoothie Bowl", price: 250, description: "Acai, banana, granola, fresh fruits", category: "Bowls", available: true },
    ],
  },
  {
    name: "Barrio Grill",
    description: "Filipino comfort food with grilled specialties.",
    address: "56 Mabini Road, Pasig",
    menus: [
      { name: "Chicken Inasal", price: 180, description: "Calamansi, soy, garlic marinade", category: "Grill", available: true },
      { name: "Pork BBQ Skewers (3 pcs)", price: 150, description: "Sweet & smoky Filipino-style", category: "Grill", available: true },
      { name: "Kare-Kare", price: 320, description: "Oxtail stew in peanut sauce, bagoong", category: "Main", available: true },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding…");

  // 1) Insert restaurants and capture their generated IDs
  const insertedRestaurants = await db
    .insert(restaurants)
    .values(
      seedData.map((r) => ({
        ownerId: OWNER_ID,
        name: r.name,
        description: r.description || null,
        address: r.address || null,
        createdAt: nowMs,                // matches your integer ms column + default(nowMs)
        ratingAvg: 0,
        ratingCount: 0,
      }))
    )
    .returning({ id: restaurants.id, name: restaurants.name });

  // Build a quick name->id map so we can attach menus to the right restaurant.
  const idByName = new Map(insertedRestaurants.map((r) => [r.name, r.id]));

  // 2) Prepare menu items to insert
  const menuRows = seedData.flatMap((r) => {
    const rid = idByName.get(r.name);
    if (!rid) return [];
    return r.menus.map((m) => ({
      restaurantId: rid,
      name: m.name,
      price: m.price, // adapt to cents if your schema uses INTEGER cents
      description: m.description || null,
      category: m.category || null,
      available: m.available ?? true,
      createdAt: nowMs,
    }));
  });

  if (menuRows.length > 0) {
    await db.insert(menuItems).values(menuRows);
  }

  console.log(`✅ Done. Inserted ${insertedRestaurants.length} restaurants and ${menuRows.length} menu items.`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => {
    client.close();
  });
