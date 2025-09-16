// scripts/seed.ts
import { db } from "@/db/index";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("password123", 10);

  await db.insert(users).values({
    email: "test@example.com",
    passwordHash: hash,
    isRestaurantOwner: false,
  });

  console.log("✅ Seed user created: test@example.com / password123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
