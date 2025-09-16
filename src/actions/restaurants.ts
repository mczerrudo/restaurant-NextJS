"use server";
import "server-only";
import { db } from "@/db/index";
import { restaurants } from "@/db/schema";
import { createRestaurantSchema } from "@/lib/validators";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, desc, like } from "drizzle-orm";

export async function listRestaurants(search: string = "") {
  const rows = await db
    .select()
    .from(restaurants)
    .where(like(restaurants.name, `%${search}%`)); // will match all if search = ""

  return rows;
}

export async function listRestaurantsByOwner(ownerId?: number) {
  const user = await requireUser();
  const id = ownerId ?? user.id;
  const rows = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.ownerId, id))
    .orderBy(desc(restaurants.createdAt));
  return rows; // ✅ plain object/arrays only
}

export async function createRestaurant(_: any,
  form: FormData | { name: string; description?: string }
) {
  const user = await requireUser();
  const payload =
    form instanceof FormData
      ? {
          name: String(form.get("name") || ""),
          description: String(form.get("description") || "") || undefined,
        }
      : form;

  const parsed = createRestaurantSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: parsed.error.flatten() };

  try {
    await db.insert(restaurants).values({
      ownerId: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
    });
    revalidatePath("/owner/restaurants");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteRestaurant(_: any, form: FormData | { id: number }) {
  const user = await requireUser();
  const id = form instanceof FormData ? Number(form.get("id")) : form.id;
  try {
    await db
      .delete(restaurants)
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)));
    revalidatePath("/owner/restaurants");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function updateRestaurant(
 _: any,
  form: FormData | { id: number; name: string; description?: string }
) {
  try {
    const user = await requireUser();

    const { id, name, description } = form instanceof FormData
      ? {
          id: Number(form.get("id")),
          name: String(form.get("name") || ""),
          description: String(form.get("description") || "") || undefined,
        }
      : { id: form.id, name: form.name, description: form.description };

    // Only allow updating restaurants owned by the user
    const result = await db
      .update(restaurants)
      .set({ name, description })
      .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)))
      .returning({ id: restaurants.id });

    if (result.length === 0) {
      return { ok: false, error: "Restaurant not found or not authorized" };
    }

    revalidatePath("/owner/restaurants");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to update restaurant" };
  }
}

export async function getRestaurant(id: number) {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.id, id), eq(restaurants.ownerId, user.id)))
    .limit(1);
  return row || null;
}