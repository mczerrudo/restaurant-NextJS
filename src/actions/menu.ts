"use server";
import "server-only";
import { db } from "@/db/index";
import { menuItems, restaurants } from "@/db/schema";
import { upsertMenuItemSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";

export async function listMenuItems(restaurantId: number) {
  // No auth restriction for listing (public)
  const rows = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantId))
    .orderBy(desc(menuItems.createdAt));
  return rows;
}

export async function createMenuItem(form: FormData | any) {
  const user = await requireUser();
  const data = form instanceof FormData ? {
    restaurantId: Number(form.get("restaurantId")),
    name: String(form.get("name") || ""),
    price: Number(form.get("price") || 0),
    description: (form.get("description") as string) || undefined,
    category: (form.get("category") as string) || undefined,
    available: String(form.get("available") || "true") === "true",
  } : form;

  const parsed = upsertMenuItemSchema.safeParse(data);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  // Ensure the current user owns the restaurant
  const [rest] = await db.select().from(restaurants)
    .where(and(eq(restaurants.id, parsed.data.restaurantId), eq(restaurants.ownerId, user.id)))
    .limit(1);
  if (!rest) return { ok: false, error: "Forbidden" };

  try {
    await db.insert(menuItems).values(parsed.data);
      revalidatePath(`/owner/${parsed.data.restaurantId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateMenuItem(id: number, patch: Partial<{ name: string; price: number; description?: string; category?: string; available: boolean }>) {
  const user = await requireUser();
  // enforce ownership by join against restaurants
  const [mi] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!mi) return { ok: false, error: "Not found" };
  const [rest] = await db.select().from(restaurants)
    .where(and(eq(restaurants.id, mi.restaurantId), eq(restaurants.ownerId, user.id)))
    .limit(1);
  if (!rest) return { ok: false, error: "Forbidden" };

  try {
    await db.update(menuItems).set(patch).where(eq(menuItems.id, id));
    revalidatePath(`/owner/restaurants/${mi.restaurantId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteMenuItem(id: number) {
  const user = await requireUser();
  const [mi] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  if (!mi) return { ok: false, error: "Not found" };
  const [rest] = await db.select().from(restaurants)
    .where(and(eq(restaurants.id, mi.restaurantId), eq(restaurants.ownerId, user.id)))
    .limit(1);
  if (!rest) return { ok: false, error: "Forbidden" };

  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    revalidatePath(`/owner/${mi.restaurantId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}